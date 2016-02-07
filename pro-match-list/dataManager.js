define('dataManager', ['jquery', 'knockout', 'queryApi', 'sessionApi', 'entityApi', 'QueryResults', 'arrayLogo'],
	($, ko, queryApi, sessionApi, entityApi, QueryResults, arrayLogo) => {

	    return {
	        getProMatches: function (entityType, entityId, callback) {
	            return new DataManager().getProMatches(entityType, entityId, callback);
	        }
	    };

	    function DataManager() {
	        var self = this;
	        var dataParser = new DataParser();

	        self.getProMatches = function (entityType, entityId, callback) {
	            //var queryName = 'GetProMatchAlt';
	            //var queryParameters = {
	            //    entityType: entityType,
	            //    entityId: entityId,
	            //    queryName: queryName
	            //}

	            var attributes = {
	                matchType: '4575b5ba-82c5-4fc2-bacf-75bac90a50e7',
	                awayTeam: '126b8dac-217f-4619-b9e0-efa91e9c9b47',
	                homeTeam: 'e2e56898-14e9-4ddc-bdf9-860cd070491a',
	                venue: '2a3b89c7-8b06-4290-bd4b-1031d6b8e8c7',
	                refereePosition: 'c72177a1-9bcf-47d9-98d4-b7363aa610cc',
	                refereeAccept: 'a95f5777-ea33-47e5-b546-a066eacb93a5'
	            };

	            ////"https://pro6252.edge10online.com:443/api/template/05dca773-4b20-43f0-8cb8-fa9d6ff83c63/sessions?parameters.entityType=AllSubjects&parameters.dateRangeType=CalendarMonth"

	            //var request = dataParser.parseQuery(queryParameters, attributes);
	            //request.promise.then(function (results) {
	            //    if (callback && typeof callback === "function")
	            //        callback(results);
	            //});

	            //return request.xhr;

	            //intersectDateRange=false&parameters.dateRangeType=CalendarMonth
	            console.log(sessionApi.gettemplatesessionsdata);
             
	            entityApi.getgroup('11d4309d-cc44-493e-8a42-221b225bd1e8').then((group) => {
	                sessionApi.gettemplatesessionsdata('05dca773-4b20-43f0-8cb8-fa9d6ff83c63', { dateRangeType: "Offset", dateOffset: 60 }, true).then(
                        function (data) {
                            if (callback && typeof callback === "function")
                                callback(dataParser.matchParse(data, attributes, group));
                        },
                        function (error) {
                            console.warn(error);
                            return false;
                        }
                    );

	            })

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

	            var dateOffset = utils.getDateOffset(fromDate, toDate);
	            var dateRange = { dateRangeType: 3, dateOffset: dateOffset, date: utils.displayString(toDate, "dash") };



	            return $.extend({
	                entityType: entityType,
	                entityId: entityId,
	                queryName: query
	            }, dateRange);
	        }

	        self.matchParse = function (data, attributes, allReferee) {
	            var result = [];

	            data.forEach(function (item, index, arr) {

	                var refereeList = item['contacts'].filter(function (item) {
	                    return item['contactType'] == 1;
	                });


	                refereeList = refereeList.map(function (item) {
	                    return new Referee(
                            item['contactId'],
                            utils.getValueByIndex(item['data'], attributes['refereePosition']),
                            utils.getValueByIndex(item['data'], attributes['refereeAccept']),
                            allReferee
                        );
	                });

	                result.push(new Match(
                            item['sessionDetails']['id'],
                            utils.getValueByIndex(item['data'], attributes['matchType']),
                            item['sessionDetails']['start'],
                            utils.getValueByIndex(item['data'], attributes['venue']),
                            utils.getValueByIndex(item['data'], attributes['homeTeam']),
                            utils.getValueByIndex(item['data'], attributes['awayTeam']),
                            refereeList
                        )
                    );

	            })

	            return utils.setTeamLogo(result);
	        }

	        self.parseQuery = function (queryParameters, attributes, flags) {
	            var xhr = queryApi.getquery(queryParameters);

	            var promise = xhr.then(function (resultData) {
	                var results = QueryResults.create(resultData);
	                var data = [];

	                data = new Default().get(results, attributes);

	                data = utils.setTeamLogo(data);


	                return data;
	            }).fail(function (error) {
	                console.error("Request Failed: " + JSON.stringify(error));
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
	                    if (row['metadata'] && row['metadata']['session-id']) {
	                        dataRow['id'] = row['metadata']['session-id'];
	                    }
	                    dataArray.push(dataRow);
	                });

	                return dataArray;
	            }
	        }

	        var Baseline = function () {
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
	                    } else if (attr.baseline_attribute_id) {
	                        attr.index = utils.getAttributeIdIndexesLatestDate(columns, attr.baseline_attribute_id, attr.aggregation_type)[0];
	                    } else {
	                        attr.index = utils.getHeaderIndexes(columns, attr.name)[0];
	                    }
	                });

	                var rows = results._data.rows;
	                var dataArray = [];
	                $.each(rows, function (i, row) {
	                    var dataRow = new Object();
	                    dataRow.aggregation = 'Baseline';
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
	                    if (attr.attribute_id) {
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

	        function getSessionId(item) {
	            return item['metadata']['session-id'];
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

	        function setTeamLogo(arr) {
	            arr.forEach(function (item, i, arr) {
	                if (item['homeTeam']) {
	                    let logo = arrayLogo.list.filter(function (teamData) {
	                        return teamData['name'].replace(/\s+/g, '').toLowerCase() == item['homeTeam'].replace(/\s+/g, '').toLowerCase();
	                    });
	                    item['homeTeamLogo'] = logo[0] ? logo[0]['url'] : "../theme/defaultLogo.png";
	                }
	                else {
	                    item['homeTeamLogo'] = null;
	                }

	                if (item['awayTeam']) {
	                    let logo = arrayLogo.list.filter(function (teamData) {
	                        return teamData['name'].replace(/\s+/g, '').toLowerCase() == item['awayTeam'].replace(/\s+/g, '').toLowerCase();
	                    });
	                    item['awayTeamLogo'] = logo[0] ? logo[0]['url'] : "../theme/defaultLogo.png";
	                }
	                else {
	                    item['awayTeamLogo'] = null;
	                }
	            });
	            return arr;
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

	        function getValueByIndex(arr, idx) {
	            var result = ' - ';
	            arr.forEach(function (item, index, arr) {
	                if (item['attributeDefinitionId'] == idx) {
	                    result = item['lookupValues'].length ? item['lookupValues'][0]['value'] : " - ";
	                }
	            });
	            return result;
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
	            },
	            setTeamLogo: function (dataArray) {
	                return setTeamLogo(dataArray);
	            },
	            getValueByIndex: function (arr, index) {
	                return getValueByIndex(arr, index);
	            }
	        }
	    }

	    function Match(id, matchType, date, vanue, homeTeam, awayTeam, gameData) {
	        this.id = id,
            this.matchType = matchType,
	        this.date = date,
            this.venue = vanue ? vanue : ' - ',
            this.homeTeam = homeTeam,
            this.homeTeamLogo = "",
	        this.awayTeam = awayTeam,
	        this.awayTeamLogo = "",
	        this.isVisibleInfo = ko.observable(false),
	        this.gameData = gameData;
	        this.color = setColor(gameData);
	        this.assigned = gameData.length == 4 ? true : false;
	    };

	    function Referee(id, refereePosition, accept, allReferee) {
	        this.id = id,
	        this.refereePosition = refereePosition,
	        this.status = "Assigned",
	        this.statusColor = "green",
	        this.name = getRefereeName(id, allReferee),
	        this.accept = accept;
	    }

	    function setColor(refereeArr) {
	        console.log(refereeArr);
	        if (refereeArr.length < 4) {
	            return "red";
	        }

	        var assignedCount = refereeArr.filter(function (item) {
	            return item['accept'] == 'Accepted';
	        })

	        console.log(assignedCount);

	        if (assignedCount.length == 4) {
	            return "green";
	        }
	        else{
	            return "amber";
	        }
	    }

	    function getRefereeName(id, arr) {
	        var result = " - ";
	        arr.forEach(function (item) {
	            if (item['id'] == id) {
	                result = item['firstName'] + ' ' + item['lastName'];
	            }
	        })
	        return result;
	    }

	});