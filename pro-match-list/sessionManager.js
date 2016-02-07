﻿define('sessionManager', ['jquery', 'knockout', 'sessionApi', 'entityApi', 'templateApi'],
	function ($, ko, sessionApi, entityApi, templateApi) {
	    var instance;

	    function createInstance() {
	        return new SessionManager();
	    }

	    return {
	        getInstance: function () {
	            if (!instance) {
	                instance = createInstance();
	            }
	            return instance;
	        }
	    };

	    function SessionManager() {
	        var self = this;
	        self.userId = ko.observable();
	        self.session = ko.observable();
	        self.selectedSession = ko.observable();
	        self.selectedTemplate = ko.observable();
	        self.attributes = {
	            matchLocation: "2a3b89c7-8b06-4290-bd4b-1031d6b8e8c7",
	            awayTeam: "e2e56898-14e9-4ddc-bdf9-860cd070491a",
	            homeTeam: "126b8dac-217f-4619-b9e0-efa91e9c9b47",
	            gameType: "4575b5ba-82c5-4fc2-bacf-75bac90a50e7",
	            gameTime: "d61fa4bb-22d7-43ce-8998-6b419e67cc85",
	            gender: "ca9781c5-3578-44ed-a3ca-34b4af26a3bf",
	            league: "2ec81e66-8786-4fa7-96c5-8809942293e4"
	        };
	        self.teamsListAll = ko.observableArray();
	        self.typesListAll = ko.observableArray();
	        self.matchLocationsListAll = ko.observableArray();
	        self.gendersListAll = ko.observableArray();
	        self.leaguesListAll = ko.observableArray();

	        self.callback = ko.observable();

	        self.saveSession = function () {
	            return new Promise(function (resolve, reject) {
	                var data = ko.toJSON(self.session());

	                sessionApi.postsession(data).then(
                        function (response) {
                            console.log("Changes has been saved");
                            resolve(response);

                            if (self.callback() && typeof self.callback() === "function")
                                self.callback()(true, response);
                        },
                        function (error) {
                            console.warn(error);
                            reject(error);

                            if (self.callback() && typeof self.callback() === "function")
                                self.callback()(false, error);
                        }
                    );
	            })
	        };

	        self.createMatch = function (newMatch, callback) {
	            self.callback(callback);
	            self.session(self.selectedSession());
	            var data = self.session().data;

	            for (var i = 0; i < data.length; i++) {
	                if (data[i].attributeDefinitionId == self.attributes.homeTeam) {
	                    if (data[i].lookupValues[0] == undefined) {
	                        data[i].lookupValues[0] = {id: null, value: ''};
	                    }
	                    data[i].lookupValues[0].id = newMatch.homeTeam.id;
	                    data[i].lookupValues[0].value = newMatch.homeTeam.name;
	                }
	                else if (data[i].attributeDefinitionId == self.attributes.awayTeam) {
	                    if (data[i].lookupValues[0] == undefined) {
	                        data[i].lookupValues[0] = { id: null, value: '' };
	                    }
	                    data[i].lookupValues[0].id = newMatch.awayTeam.id;
	                    data[i].lookupValues[0].value = newMatch.awayTeam.name;
	                }
	                else if (data[i].attributeDefinitionId == self.attributes.matchLocation) {
	                    if (data[i].lookupValues[0] == undefined) {
	                        data[i].lookupValues[0] = { id: null, value: '' };
	                    }
	                    data[i].lookupValues[0].id = newMatch.matchLocation.id;
	                    data[i].lookupValues[0].value = newMatch.matchLocation.name;
	                }
	                else if (data[i].attributeDefinitionId == self.attributes.gameType) {
	                    if (data[i].lookupValues[0] == undefined) {
	                        data[i].lookupValues[0] = { id: null, value: '' };
	                    }
	                    data[i].lookupValues[0].id = newMatch.gameType.id;
	                    data[i].lookupValues[0].value = newMatch.gameType.name;
	                }
	                else if (data[i].attributeDefinitionId == self.attributes.gender) {
	                    if (data[i].lookupValues[0] == undefined ) {
	                        data[i].lookupValues[0] = { id: null, value: '' };
	                    }
	                    data[i].lookupValues[0].id = newMatch.gender.id;
	                    data[i].lookupValues[0].value = newMatch.gender.name;
	                }
	                else if (data[i].attributeDefinitionId == self.attributes.league) {
	                    if (data[i].lookupValues[0] == undefined) {
	                        data[i].lookupValues[0] = { id: null, value: '' };
	                    }
	                    data[i].lookupValues[0].id = newMatch.league.id;
	                    data[i].lookupValues[0].value = newMatch.league.name;
	                }
	                else if (data[i].attributeDefinitionId == self.attributes.gameTime) {
	                    data[i].value = newMatch.gameTime;
	                }
	                else {
	                    if (data[i].value != undefined) {
	                        data[i].value = '';
	                    }
	                    if (data[i].lookupValues != undefined) {
	                        data[i].lookupValues[0].id = '';
	                        data[i].lookupValues[0].value = '';
	                        data[i].lookupValues[0].index = 0;
	                        data[i].lookupValues[0].score = 0;
	                    }
	                }
	            }

	            self.session().sessionDetails.start = newMatch.date.toISOString();
	            self.session().sessionDetails.end = newMatch.date.toISOString();
	            self.session().sessionDetails.id = '';
	            self.session().sessionDetails.lastUpdated = "";
	            self.session().sessionDetails.lastUpdatedById = "";
	            self.session().sessionDetails.creatorId = self.userId();
	            for (var i = 0; i < self.session().contacts.length; i++) {
	                if (self.session().contacts[i].contactId != self.userId()) {
	                    //self.session().contacts[i] = {};
	                    self.session().contacts.splice(i, 1);
	                }
	            }
	           // self.session().contacts = [];

	            self.saveSession();
	        }


	        self.getDateOffset = function (firstDate, secondDate) {
	            var day = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds	            
	            var dateOffset = Math.round((firstDate.getTime() - secondDate.getTime()) / (day));

	            return dateOffset;
	        }

	        self.getAttributeFromTemplateById = function (template, id) {
	            var attribute = $.grep(template.sessionAttributeDefinitions, function (e) { return e.id == id });
	            if (attribute && attribute.length > 0)
	                return attribute[0].lookup.values;
	            return null;
	        }

	        self.loadSession = function (session) {
	            if (self.selectedSession()) {
	                templateApi.gettemplate(self.selectedSession().sessionDetails.sessionTypeId).then(function (template) {
	                    self.selectedTemplate(template);

	                    self.typesListAll(self.getAttributeFromTemplateById(template, self.attributes.gameType));
	                    self.teamsListAll(self.getAttributeFromTemplateById(template, self.attributes.homeTeam));
	                    self.matchLocationsListAll(self.getAttributeFromTemplateById(template, self.attributes.matchLocation));
	                    self.gendersListAll(self.getAttributeFromTemplateById(template, self.attributes.gender));
	                    self.leaguesListAll(self.getAttributeFromTemplateById(template, self.attributes.league));
	                });
	            }
	            else {
	                self.selectedTemplate(null);
	            }
	        }

	        self.loadSessions = function (entityType, entityId) {
	            self.userId(entityId);

	            var startDate = new Date(new Date().getFullYear(), 0, 1); // First day of the year.
	            var currentDate = new Date();
	            var dateOffset = self.getDateOffset(startDate, currentDate);

	            var dateRange = { dateRangeType: "Offset", dateOffset: dateOffset, date: currentDate };
	            var filterParameters = $.extend({
	                entityId: self.userId(),
	                entityType: entityType,
	            }, dateRange);

	            $.when(sessionApi.gettemplatesessionsdata('05dca773-4b20-43f0-8cb8-fa9d6ff83c63'))
                    .then(function (sessions) {
                        var allSessions = sessions[0];
                        self.selectedSession(allSessions);
                    });

	            templateApi.gettemplate('05dca773-4b20-43f0-8cb8-fa9d6ff83c63').then(function (template) {
	                self.selectedTemplate(template);

	                self.typesListAll(self.getAttributeFromTemplateById(template, self.attributes.gameType));
	                self.teamsListAll(self.getAttributeFromTemplateById(template, self.attributes.homeTeam));
	                self.matchLocationsListAll(self.getAttributeFromTemplateById(template, self.attributes.matchLocation));
	                self.gendersListAll(self.getAttributeFromTemplateById(template, self.attributes.gender));
	                self.leaguesListAll(self.getAttributeFromTemplateById(template, self.attributes.league));
	            });

	        };

	     //   self.selectedSession.subscribe(self.loadSession.bind(self));
	    }
	});