﻿define('dataManager',
    ['jquery', 'knockout', 'commentApi', 'queryApi', 'QueryResults'],
	($, ko, commentApi, queryApi, QueryResults) => {
	    
	    class DataManager {
	        constructor() {
	            let self = this;
	            
	            self.currenMatch = ko.observable(null);
	            self.currenThreadId = ko.observable(null);
	            self.saveThread = (matchId, participantsList) => {
	                //todo: add check match thread id
	                self.currenMatch(matchId);

	                let data = ko.toJSON(new Thread('some', participantsList, self.currenThreadId()));

	                if (!self.currenThreadId()) {
	                    commentApi.createthread(data).then((newTread) => {
	                        self.currenThreadId(newTread['id']);
	                        return newTread;
	                    },
                            (error) => console.log(error)
                        )
	                }
	                else {
	                    commentApi.updatethread(data).then(
                            (updatedTread) => updatedTread,
                            (error) => console.log(error)
                        )
	                }
	            };

	            

	            function Utils() {
	                function getFirstYearDay() {
	                    return new Date(new Date().getFullYear(), 0, 1);
	                }

	                function getDateOffset(firstDate, secondDate) {
	                    var day = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds	            
	                    var dateOffset = Math.round((firstDate.getTime() - secondDate.getTime()) / (day));

	                    return dateOffset;
	                }

	                function isDate(date) {
	                    if (date === null || date === undefined) return false;
	                    return date.toString().match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
	                }

	                function getHeaderIndexes(list, header) {
	                    return $.map(list, function (obj, index) {
	                        if (obj.header.toLowerCase().startsWith(header.toLowerCase())) {
	                            return index;
	                        }
	                    });
	                }

	                function getAttributeIdIndexes(list, id) {
	                    return $.map(list, function (obj, index) {
	                        if (obj.metadata && obj.metadata['attribute-id'] === id) {
	                            return index;
	                        }
	                    });
	                }

	                function getAttributeIdIndexesLatestDate(list, id, aggregation_type) {
	                    if (aggregation_type) {
	                        return $.map(list, function (obj, index) {
	                            if (obj.metadata && obj.metadata['attribute-id'] === id && obj.metadata['aggregation-type'] === aggregation_type) {
	                                return index;
	                            }
	                        });
	                    } else {
	                        return $.map(list, function (obj, index) {
	                            if (obj.metadata && obj.metadata['attribute-id'] === id && obj.metadata['aggregation-type'] === 6) {
	                                return index;
	                            }
	                        });
	                    }
	                    return [];
	                }

	                function findIndexByOffset(list, offset) {
	                    return list.filter(function (item) {
	                        return item.offset === offset;
	                    })[0];
	                }

	                function hasLookupValues(item) {
	                    if (!item)
	                        return false;
	                    return item.lookupValues !== undefined;
	                }

	                function getLookupValues(item) {
	                    var lookupValues = item.lookupValues;
	                    if (lookupValues == undefined) return '';

	                    var value = '';
	                    $.each(lookupValues, function (i, obj) {
	                        value += obj.value;
	                        value += ', ';
	                    });
	                    return value.substring(0, value.length - 2);
	                }

	                function getValue(cell) {
	                    return (cell) ? cell.value : null;
	                }

	                Date.prototype.displayStringSlash = function () {
	                    var date = new Date(+this);
	                    var day = date.getDate().toString();
	                    var month = (date.getMonth() + 1).toString();
	                    return (day.length > 1 ? day : '0' + day) + '/' + (month.length > 1 ? month : '0' + month) + '/' + date.getFullYear();
	                };

	                Date.prototype.displayStringDash = function () {
	                    var date = new Date(+this);
	                    var day = date.getDate().toString();
	                    var month = (date.getMonth() + 1).toString();
	                    return date.getFullYear() + '-' + (month.length > 1 ? month : '0' + month) + '-' + (day.length > 1 ? day : '0' + day);
	                };

	                Date.prototype.displayStringShort = function () {
	                    var date = new Date(+this);
	                    var day = date.getDate().toString();
	                    var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	                    var month = month_names_short[date.getMonth()];

	                    return (day.length > 1 ? day : '0' + day) + '-' + month + '-' + date.getFullYear();
	                };

	                Date.prototype.displayStringFull = function () {
	                    var date = new Date(+this);
	                    var day = date.getDate().toString();
	                    var month = (date.getMonth() + 1).toString();

	                    var hours = date.getHours().toString();
	                    var minutes = date.getMinutes().toString();
	                    var seconds = date.getSeconds().toString();

	                    return (day.length > 1 ? day : '0' + day) + '/' + (month.length > 1 ? month : '0' + month) + '/' + date.getFullYear()
                            + ' ' + (hours.length > 1 ? hours : '0' + hours) + ":" + (minutes.length > 1 ? minutes : '0' + minutes) + ":" + (seconds.length > 1 ? seconds : '0' + seconds);
	                };

	                function displayString(date, format) {
	                    if (format === 'short') {
	                        return date.displayStringShort();
	                    } else if (format === 'slash') {
	                        return date.displayStringSlash();
	                    } else if (format === 'full') {
	                        return date.displayStringFull();
	                    } else if (format === 'dash') {
	                        return date.displayStringDash();
	                    } else {
	                        return date.displayStringSlash();
	                    }
	                }

	                function round(value, places) {
	                    if (!value) return null;
	                    return value.toFixed(places);
	                }

	                return {
	                    getFirstYearDay: function () {
	                        return getFirstYearDay();
	                    },
	                    getDateOffset: function (firstDate, secondDate) {
	                        return getDateOffset(firstDate, secondDate);
	                    },
	                    isDate: function (date) {
	                        return isDate(date);
	                    },
	                    getHeaderIndexes: function (list, header) {
	                        return getHeaderIndexes(list, header);
	                    },
	                    getAttributeIdIndexes: function (list, id) {
	                        return getAttributeIdIndexes(list, id);
	                    },
	                    getAttributeIdIndexesLatestDate: function (list, id, aggregation_type) {
	                        return getAttributeIdIndexesLatestDate(list, id, aggregation_type);
	                    },
	                    findIndexByOffset: function (list, offset) {
	                        return findIndexByOffset(list, offset);
	                    },
	                    hasLookupValues: function (item) {
	                        return hasLookupValues(item);
	                    },
	                    getLookupValues: function (lookupValues) {
	                        return getLookupValues(lookupValues);
	                    },
	                    getValue: function (cell) {
	                        return getValue(cell);
	                    },
	                    displayString: function (date, format) {
	                        return displayString(date, format);
	                    },
	                    round: function (value, places) {
	                        return round(value, places);
	                    }
	                }
	            }
	            function DataParser() {
	                var self = this;
	                var utils = new Utils();

	                Array.prototype.unique = function () {
	                    var n = {}, r = [];
	                    for (var i = 0; i < this.length; i++) {
	                        if (!n[this[i]]) {
	                            n[this[i]] = true;
	                            r.push(this[i]);
	                        }
	                    }
	                    return r;
	                };

	                Array.prototype.pushUnique = function (value) {
	                    var found = $.inArray(value, this);
	                    if (found < 0) {
	                        this.push(value);
	                    }
	                    return this;
	                };

	                Array.prototype.contains = function (value) {
	                    return ($.inArray(value, this) === -1) ? false : true;
	                }

	                self.getQueryParameters = function (entityType, entityId, query, fromDate, toDate) {
	                    if (!fromDate && !toDate) {
	                        toDate = new Date();
	                        // date from old
	                        //fromDate = utils.getFirstYearDay();
	                        fromDate = new Date();
	                        fromDate.setDate(fromDate.getDate() - 365);
	                    }

	                    //var dateOffset = utils.getDateOffset(fromDate, toDate);
	                    //var dateRange = { dateRangeType: 3, dateOffset: dateOffset, date: utils.displayString(toDate, "dash") };
	                    //var queryParameters = {
	                    //    entityType: entityType,
	                    //    entityId: entityId,
	                    //    queryName: query
	                    //};

	                    return queryParameters
	                }

	                self.parseQuery = function (queryParameters, attributes, flags) {
	                    var xhr = queryApi.getquery(queryParameters);
	            
	                    var promise = xhr.then(function (results) {
	                        var results = QueryResults.create(results);
	                        var data = [];
	                        if (!flags || flags.contains('default')) {
	                            data = new Default().get(results, attributes);
	                        } else {
	                            if (flags.contains('baseline')) {
	                                data = data.concat(new Baseline().get(results, attributes));
	                            } if (flags.contains('latest')) {
	                                data = data.concat(new Latest().get(results, attributes));
	                            }
	                        }

	                        return data;
	                    }).fail(function (error) {
	                        console.log("Request Failed: " + JSON.stringify(error));
	                        return [];
	                    });

	                    return { xhr: xhr, promise: promise };
	                }

	                var Default = function () {
	                    var getCell = function (row, attr) {
	                        var cell = new Object();
	                        var index = attr.index;
	                        if (utils.hasLookupValues(row.cells[index])) {
	                            cell.value = utils.getLookupValues(row.cells[index]);
	                        } else {
	                            cell.value = utils.getValue(row.cells[index]);
	                        }

	                        if (utils.isDate(cell.value)) {
	                            var date = new Date(cell.value);
	                            cell.value = date;
	                            cell.dateString = utils.displayString(date, attr.format);
	                        }

	                        if (attr.round) {
	                            cell.value = utils.round(cell.value, attr.round);
	                        }

	                        return cell;
	                    }

	                    this.get = function (results, attributes) {
	                        var columns = results._data.columns;
	                
	                        $.each(attributes, function (i, attr) {
	                            if (attr.index) {
	                                // Do nothing here. We have index already.
	                            } else if (attr.attribute_id) {
	                                attr.index = utils.getAttributeIdIndexes(columns, attr.attribute_id)[0];
	                            } else {
	                                attr.index = utils.getHeaderIndexes(columns, attr.name)[0];
	                            }
	                        });

	                        var rows = results._data.rows;
	                        var dataArray = [];
	                        $.each(rows, function (i, row) {
	                            var dataRow = new Object();
	                            $.each(attributes, function (j, attr) {
	                                dataRow[attr.attribute] = getCell(row, attr);
	                            });
	                            dataArray.push(dataRow);
	                        });

	                        return dataArray;
	                    }
	                }
	                var Latest = function () {
	                    var setIndex = function (columns, attr, latests) {
	                        var indexes = utils.getAttributeIdIndexesLatestDate(columns, attr.attribute_id, attr.aggregation_type);
	                        attr.offsets = [];

	                        $.each(indexes, function (j, index) {
	                            var offset = columns[index].metadata['aggregation-offset'];
	                            attr.offsets.push({ offset: offset, index: index });

	                            latests.pushUnique(offset);
	                        });
	                    }

	                    var setIndexWithIndex = function (attr, latests) {
	                        attr.offsets = [];
	                        //offset if no index
	                        attr.offsets.push({ offset: 0, index: attr.index });
	                        latests.pushUnique(0);
	                    }

	                    var setIndexByName = function (columns, attr, latests) {
	                        var indexes = utils.getHeaderIndexes(columns, attr.name);
	                        attr.offsets = [];

	                        $.each(indexes, function (i, index) {
	                            var offset = columns[index].metadata['aggregation-offset'];
	                            attr.offsets.push({ offset: offset, index: index });

	                            latests.pushUnique(offset);
	                        });
	                    }

	                    var getCell = function (row, aggregation, attr) {
	                        var cell = new Object();
	                        var index = aggregation.index;
	                        if (utils.hasLookupValues(row.cells[index])) {
	                            cell.value = utils.getLookupValues(row.cells[index]);
	                        } else {
	                            cell.value = utils.getValue(row.cells[index]);
	                        }

	                        if (utils.isDate(cell.value)) {
	                            var date = new Date(cell.value);
	                            cell.value = date;
	                            cell.dateString = utils.displayString(date, attr.format);
	                        }

	                        if (attr.round) {
	                            cell.value = utils.round(cell.value, attr.round);
	                        }

	                        return cell;
	                    }

	                    this.get = function (results, attributes) {
	                        var columns = results._data.columns;
	                        var latests = [];

	                        $.each(attributes, function (i, attr) {
	                            if(attr.index !== undefined){
	                                setIndexWithIndex(attr, latests);
	                            }
	                            else if(attr.attribute_id) {
	                                setIndex(columns, attr, latests);
	                            } else {
	                                setIndexByName(columns, attr, latests);
	                            }
	                        });

	                        var rows = results._data.rows;
	                        var dataArray = [];
	                        $.each(rows, function (i, row) {
	                            $.each(latests, function (k, offset) {
	                                var dataRow = new Object();
	                                $.each(attributes, function (j, attr) {
	                                    var aggregation = utils.findIndexByOffset(attr.offsets, offset);
	                                    if (aggregation) {
	                                        dataRow.aggregation = (aggregation.offset === 0) ? 'Latest' : ('Latest-' + aggregation.offset);
	                                        dataRow[attr.attribute] = getCell(row, aggregation, attr);
	                                    } else {
	                                        dataRow[attr.attribute] = { value: null };
	                                    }
	                                });
	                                dataArray.push(dataRow);
	                            });
	                        });

	                        return dataArray;
	                    }
	                }
	            }

	            let dataParser = new DataParser();


	            self.getProReferee = (entityType, entityId, callback) => {

	                let queryName = 'getProRefereeLatest';

	                var queryParameters = {
	                    entityType: entityType,
	                    entityId: entityId,
	                    queryName: queryName
	                };

	                //let queryParameters = dataParser.getQueryParameters(entityType, entityId, queryName);

	                let attributes = [
                        //{ attribute: 'accept', attribute_id: 'aff18ae3-38c5-42ea-88e9-71be0427f83b' },
                        //{ attribute: 'position', attribute_id: '0d5e554b-c457-4299-a2b8-3b4924dd9c9c' },
                        //{ attribute: 'status', attribute_id: 'd77c0be1-8664-4863-8299-749f6b342618' },
                        { attribute: 'firstName', index: 0 },
                        { attribute: 'name', index: 1 },
                        { attribute: 'score', attribute_id: 'ca7767c5-02fb-430a-a9a0-87155156a2de' },
                        { attribute: 'color', attribute_id: 'a5bff08e-0637-48d4-a6ab-5bd039c27c99' },
                        { attribute: 'violations', attribute_id: 'db0ac9e9-a72b-4c7d-9595-fe91924da7cf' }
	                ];

	                var flags = ['latest'];


	                let request = dataParser.parseQuery(queryParameters, attributes, flags);
	                request.promise.then(function (results) {
	                    if (callback && typeof callback === "function")
	                        callback(results);
	                });
	                return request.xhr;

	            };

	        }
	    };

	    class Thread {
	        constructor(title, arrayParticipants, threadId) {
	            let self = this;
	            self.title = title;
	            self.participants = arrayParticipants.map((id) => { id: id });
	            if (threadId) self.id = threadId;
	        }
	    }

	    return {
	        create() {
	            return new DataManager();
	        }
	    };

	});