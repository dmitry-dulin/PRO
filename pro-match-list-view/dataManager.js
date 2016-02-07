﻿define('dataManager', ['jquery', 'knockout', 'queryApi', 'sessionApi', 'entityApi', 'QueryResults', 'arrayLogo'],
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

	            var attributes = {
	                matchType: '4575b5ba-82c5-4fc2-bacf-75bac90a50e7',
	                awayTeam: '126b8dac-217f-4619-b9e0-efa91e9c9b47',
	                homeTeam: 'e2e56898-14e9-4ddc-bdf9-860cd070491a',
	                venue: '2a3b89c7-8b06-4290-bd4b-1031d6b8e8c7',
	                refereePosition: 'c72177a1-9bcf-47d9-98d4-b7363aa610cc',
	                refereeAccept: 'a95f5777-ea33-47e5-b546-a066eacb93a5'
	            };
            
	            entityApi.getgroup('11d4309d-cc44-493e-8a42-221b225bd1e8').then((group) => {
	                sessionApi.gettemplatesessionsdata('05dca773-4b20-43f0-8cb8-fa9d6ff83c63', { dateRangeType: "Offset", dateOffset: 60 }, true).then(
                        function (data) {
                            if (callback && typeof callback === "function")
                                callback(dataParser.matchParse(data, attributes, group, entityId));
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

	        self.matchParse = function (data, attributes, allReferee, entityId) {
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
                            refereeList,
                            entityId
                        )
                    );

	            })

	            return utils.setTeamLogo(result);
	        }

	    }

	    function Utils() {
	        
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
	            setTeamLogo: function (dataArray) {
	                return setTeamLogo(dataArray);
	            },
	            getValueByIndex: function (arr, index) {
	                return getValueByIndex(arr, index);
	            }
	        }
	    }

	    function Match(id, matchType, date, venue, homeTeam, awayTeam, gameData, entityId) {
	        this.id = id,
            this.matchType = matchType,
	        this.date = date,
            this.venue = venue ? venue : ' - ',
            this.homeTeam = homeTeam,
            this.homeTeamLogo = "",
	        this.awayTeam = awayTeam,
	        this.awayTeamLogo = "",
	        this.isVisibleInfo = ko.observable(false),
            this.suggestionPosition = getSuggestionPosition(gameData, entityId),
	        this.gameData = gameData;
	        this.futureMatch = new Date(date) > new Date;
	        this.refereeId = entityId;
	        this.accepted = ko.observable(getRefereeState(gameData, entityId));
	    };

	    function Referee(id, refereePosition, accept, allReferee) {
	        this.id = id,
	        this.refereePosition = refereePosition,
	        this.status = "Assigned",
	        this.statusColor = "green",
	        this.name = getRefereeName(id, allReferee),
	        this.accept = ko.observable(accept);
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

	    function getSuggestionPosition(arr, id) {
	        var position = " - ";
	        arr.forEach(function (item) {
	            if (item['id'] == id) {
	                position = item['refereePosition'];
	            }
	        })

	        return position;
	    }

	    function getRefereeState(arr, id) {
	        var state = null;
	        arr.forEach(function (item) {
	            if (item['id'] == id) {
	                if (item['accept']() == "Accepted") {
	                    state = true;
	                }
	                else if (item['accept']() == "Rejected") {
	                    state = false;
	                }
	            }
	        })

	        return state;
	    }

	    

	});