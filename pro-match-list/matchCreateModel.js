﻿require(
    ['jquery', 'jquery.ui', 'knockout', 'loader', 'dataManager', 'sessionManager', 'EntityNavigationViewModel', 'entityApi', 'ko.plus'],
	function ($, ui, ko, LoadManager, DataManager, SessionManager, EntityNavigationViewModel, entityApi) {

	    var entityNavigator = EntityNavigationViewModel.getSingleton();
	    var sessionManager = SessionManager.getInstance();
	    var entityId = '30dee769-d11a-43ac-bade-1fdb77561537';
	    var entityType = '2';

	    

	    function TeamModel(data) {
	        //constructor(data) {
	        var self = this;
	        self.id = ko.observable(data.id);
	        self.name = ko.observable(data.value);
	        self.selected = ko.observable(false);
	        // }
	    }

	    function TypeModel(data) {
	        //constructor(data) {
	        var self = this;
	        self.id = ko.observable(data.id);
	        self.name = ko.observable(data.value);
	        // }
	    }

	    function LocationModel(data) {
	        //constructor(data) {
	        var self = this;
	        self.id = ko.observable(data.id);
	        self.name = ko.observable(data.value);
	        // }
	    }

	    function MatchCreateModel() {
	        //constructor() {
	        var self = this;
	        self.date = ko.observable();
	        self.matchTime = ko.observable();
	        self.selectedTeamOne = ko.observable();
	        self.selectedTeamTwo = ko.observable();
	        self.selectedType = ko.observable();
	        self.selectedLocation = ko.observable();
	        self.selectedGender = ko.observable();
	        self.selectedLeague = ko.observable();
	        self.teamsList = ko.observableArray();
	        self.typesList = ko.observableArray();
	        self.locationList = ko.observableArray();
	        self.gendersList = ko.observableArray();
	        self.leaguesList = ko.observableArray();
	        self.popupOpened = ko.observable(false);
	        self.placeholderTeamOne = 'Select Home Team';
	        self.placeholderTeamTwo = 'Select Away Team';
	        self.placeholderType = 'Select Game Level';
	        self.placeholderLocation = 'Select Match Location';
	        self.placeholderGender = 'Select Match Gender';
	        self.placeholderLeague = 'Select Match League';
	        self.validationText = ko.observable('');
	        self.created = ko.observable(false);

	        self.cleanParameters = function () {
	            self.date(new Date());
	            self.matchTime({ value: '', placeholder: 'Enter start time' });
	            self.selectedTeamOne({ id: null, name: self.placeholderTeamOne });
	            self.selectedTeamTwo({ id: null, name: self.placeholderTeamTwo });
	            self.selectedType({ id: null, name: self.placeholderType });
	            self.selectedLocation({ id: null, name: self.placeholderLocation });
	            self.selectedGender({ id: null, name: self.placeholderGender });
	            self.selectedLeague({ id: null, name: self.placeholderLeague });
	            self.created(false);

	            self.updateList(null);
	        }

	        self.stopPropagationLink = function (data, event) { event.stopPropagation(); }

	        self.onCreateBtnClick = function () {
	            self.popupOpened(true);
	        }

	        self.cancelBtnClick = function () {
	            self.popupOpened(false);
	            self.cleanParameters();
	        }

	        self.createTeam = function () {
	            self.created(true);
	            var newMatch = {
	                date: self.date(),
	                gameTime: self.matchTime().value,
	                homeTeam: self.selectedTeamOne(),
	                awayTeam: self.selectedTeamTwo(),
	                matchLocation: self.selectedLocation(),
	                gameType: self.selectedType(),
	                gender: self.selectedGender(),
	                league: self.selectedLeague()
	            };

	            var isValid = self.validationCreate();
	            if (isValid) {

	                sessionManager.createMatch(newMatch, function (success, response) {
	                    if (success) {
	                        $('body').trigger('matchCreated', newMatch);
	                        window.location.reload();
	                        self.created(false);
	                        self.popupOpened(false);
	                        self.validationText('New match successfully created');
	                        setTimeout(function () { self.validationText(''); }, 2000);

	                        self.cleanParameters();
	                    }
	                    else {
	                        self.validationText('Error creating new match: check whether all fields are filled');
	                        setTimeout(function () { self.validationText(''); }, 2000);
	                    }
	                });


	            }
	            else {
	                self.created(false);
	                self.validationText('Error creating new match: check whether all fields are filled');
	                setTimeout(function () { self.validationText(''); }, 2000);
	            }

	        }

	        self.teamOneSelected = function (id, name) {
	            self.selectedTeamOne({ id: id, name: name });

	            self.updateList(id);
	            self.updateView();
	        }

	        self.teamTwoSelected = function (id, name) {
	            self.selectedTeamTwo({ id: id, name: name });

	            self.updateList(id);
	            self.updateView();
	        }

	        self.typeSelected = function (id, name) {
	            self.selectedType({ id: id, name: name });

	            self.updateView();
	        }

	        self.locationSelected = function (id, name) {
	            self.selectedLocation({ id: id, name: name });

	            self.updateView();
	        }

	        self.genderSelected = function (id, name) {
	            self.selectedGender({ id: id, name: name });

	            self.updateView();
	        }

	        self.leagueSelected = function (id, name) {
	            self.selectedLeague({ id: id, name: name });

	            self.updateView();
	        }

	        self.changeDate = function (date, obj) {
	            var newDate = new Date(obj.selectedYear, obj.selectedMonth, obj.selectedDay);
	            self.date(newDate);
	        }

	        self.validationCreate = function () {
	            var msg = '';
	            if (self.selectedTeamOne().name == self.placeholderTeamOne) {
	                msg += ' Home Team not selected';
	            }
	            if (self.selectedTeamTwo().name == self.placeholderTeamTwo) {
	                msg += ' Away Team not selected';
	            }
	            if (self.selectedType().name == self.placeholderType) {
	                msg += ' Match Type not selected';
	            }
	            if (self.selectedLocation().name == self.placeholderLocation) {
	                msg += ' Match Location not selected';
	            }
	            if (self.selectedGender().name == self.placeholderGender) {
	                msg += ' Match Gender not selected';
	            }
	            if (self.selectedLeague().name == self.placeholderLeague) {
	                msg += ' Match League not selected';
	            }
	            if (self.matchTime().value == "") {
	                msg += ' Game Time not written';
	            }
	            if (self.date() == new Date()) {
	                msg += ' Game Date not selected';
	            }

	            return msg.length == 0 ? true : false;
	        }

	        self.updateList = function (teamId) {
	            for (var i = 0; i < self.teamsList().length; i++) {
	                if (self.teamsList()[i].id === teamId) {
	                    self.teamsList()[i].selected(true);
	                }
	                else {
	                    self.teamsList()[i].selected(false);
	                }
	            }
	        };

	        self.updateView = function () {
	            ko.cleanNode(document.getElementById('match-create'));
	            ko.applyBindings(self, document.getElementById('match-create'));
	        }

	        self.cleanParameters();

	        sessionManager.teamsListAll.subscribe(function () {
	            var arr = [];
	            $.each(sessionManager.teamsListAll(), function (i, team) {
	                var newTeam = {
	                    id: team.id,
	                    name: team.value,
	                    selected: ko.observable(false)
	                };
	                arr.push(newTeam);
	            });
	            self.teamsList(arr);
	        });

	        sessionManager.typesListAll.subscribe(function () {
	            var arr = [];
	            $.each(sessionManager.typesListAll(), function (i, type) {
	                var newType = {
	                    id: type.id,
	                    name: type.value
	                };
	                arr.push(newType);
	            });
	            self.typesList(arr);
	        });

	        sessionManager.matchLocationsListAll.subscribe(function () {
	            var arr = [];
	            $.each(sessionManager.matchLocationsListAll(), function (i, location) {
	                var newLocation = {
	                    id: location.id,
	                    name: location.value
	                };
	                arr.push(newLocation);
	            });
	            self.locationList(arr);
	        });

	        sessionManager.gendersListAll.subscribe(function () {
	            var arr = [];
	            $.each(sessionManager.gendersListAll(), function (i, gender) {
	                var newGender = {
	                    id: gender.id,
	                    name: gender.value
	                };
	                arr.push(newGender);
	            });
	            self.gendersList(arr);
	        });

	        sessionManager.leaguesListAll.subscribe(function () {
	            var arr = [];
	            $.each(sessionManager.leaguesListAll(), function (i, league) {
	                var newLeague = {
	                    id: league.id,
	                    name: league.value
	                };
	                arr.push(newLeague);
	            });
	            self.leaguesList(arr);
	        });
	        // }
	    }

	    ko.bindingHandlers.loadingWhen = {
	        init: function (element) {
	            LoadManager.init(element);
	        },
	        update: function (element, valueAccessor) {
	            LoadManager.update(element, valueAccessor);
	        }
	    }

	    $('body').bind('matchCreated', function (e, data) {
	        console.log(data);
	    });

	    var matchCreateModel = new MatchCreateModel();

	    //$.when(entityApi.getgroups(true)).then(function (groups) {
	    //    var subjectsInGroup = groups[0].subjects;
	    //    var userArray = [];
	    //    $.each(subjectsInGroup, function (i, user) {
	    //        var newReferee = {
	    //            id: user.id
	    //        };
	    //        userArray.push(newReferee);
	    //    });

	    //    //  matchListViewModel.refereesList(userArray);
	    //})
	    //current entity
	    entityNavigator.ready.then(function () {
	        var userEntity = entityNavigator.currentEntity();
	        var userData = userEntity.data;
	        entityId = userData.id;
	        entityType = userEntity.entityType;

	        sessionManager.loadSessions(entityType, entityId, function () {
	            var selectedSession = sessionManager.selectedSession();
	        });
	    });


	    ko.applyBindings(matchCreateModel, document.getElementById('match-create'));
	});