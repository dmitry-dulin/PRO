require(
    ['jquery', 'knockout', 'loader', 'viewElementParametersHelper', 'dataManager', 'EntityNavigationViewModel', 'entityApi', 'sessionApi'],
	($, ko, LoadManager, viewElementParametersHelper, DataManager, EntityNavigationViewModel, entityApi, sessionApi) => {
	    //console.log(locationSearch);
	    //let dataList = [
        //    {
        //        id: 1,
        //        name: "Referee 1",
        //        score: 500,
        //        violations: null,
        //        color: "#97BD97"
        //    },
        //    {
        //        id: 2,
        //        name: "Referee 2",
        //        score: 400,
        //        violations: null,
        //        color: "#97BD97"
        //    },
        //    {
        //        id: 3,
        //        name: "Referee 3",
        //        score: 500,
        //        violations: null,
        //        color: "#97BD97"
        //    },
        //    {
        //        id: 4,
        //        name: "Referee 4",
        //        score: 500,
        //        violations: null,
        //        color: "#E8BF84"
        //    },
        //    {
        //        id: 5,
        //        name: "Referee 5",
        //        score: 500,
        //        violations: null,
        //        color: "#E8BF84"
        //    },
        //    {
        //        id: 6,
        //        name: "Referee 6",
        //        score: 500,
        //        violations: null,
        //        color: "#E8BF84"
        //    },
        //    {
        //        id: 7,
        //        name: "Referee 7",
        //        score: 200,
        //        violations: 3,
        //        color: "#EF7874"
        //    },
        //    {
        //        id: 8,
        //        name: "Referee 8",
        //        score: 200,
        //        violations: 5,
        //        color: "#EF7874"
        //    },
        //    {
        //        id: 9,
        //        name: "Referee 9",
        //        score: 200,
        //        violations: 1,
        //        color: "#EF7874"
        //    },
        //    {
        //        id: 10,
        //        name: "Referee 10",
        //        score: 200,
        //        violations: 3,
        //        color: "#EF7874"
        //    }
	    //];

	    function getParameterByName(name) {
	        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	        let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                //parse global var
                results = regex.exec(locationSearch);
	        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	    }

	    let currentMatchId = getParameterByName('matchId');
	    
	    //console.log("matchId: " + currentMatchId);
	    viewElementParametersHelper.parameters().matchId = currentMatchId;

	    let dataManager = DataManager.create();
	    let entityNavigator = EntityNavigationViewModel.getSingleton();
	    
	    //current entity
	    entityNavigator.ready.then(function () {
	        let userEntity = entityNavigator.currentEntity();
	        let userData = userEntity.data;
	        let entityId = userData.id;
	        let entityType = userEntity.entityType;
	        
	        //get template data
	        //console.log(sessionApi);
	        //sessionApi.gettemplatesessionsdata('05dca773-4b20-43f0-8cb8-fa9d6ff83c63').then((data) => {
	        //        console.log(data);
	        //    }, (error) => {
	        //        console.warn(error);
	        //    }
	        //);
	        
	        sessionApi.getsession(currentMatchId).then((data) => {
	            //console.log(data);
	            let objDataFullReferee = parseMatchReferee(data)
	            refereeListViewModel.sessionData(data);
	            refereeListViewModel.selectedSession(currentMatchId);
	            refereeListViewModel.setRefereeInfo(objDataFullReferee);
	            //console.log(1);
	        }, (error) => {
	            console.warn(error);
	        }
            );

	    });

	    //get 
	    $.when(entityApi.getgroups(true)).then(function (groups) {
	        //console.log(groups);
	        let fullTimeOfficials = "cb1a0499-8ef1-4301-87dc-69740d580e30",
	            assistantReferee = "ddc49958-9195-4251-9555-fcbb5efc1971",
	            fourthOfficials = "701876e1-5beb-4d2a-9b26-1b933ebfe627",
                MLS = "11d4309d-cc44-493e-8a42-221b225bd1e8";

	        groups.forEach((group) => {
	            //if (group.id === fullTimeOfficials) {
	            //    let refereeArray = [];
	            //    $.each(group.subjects, function (i, user) {
	            //        let createReferee = new RefereeModel({
	            //            id: user.id,
	            //            name: (user.firstName + ' ' + user.lastName)
	            //        });
	            //        refereeArray.push(createReferee);
	            //    });
	            //    refereeListViewModel.refereeListFullTime(refereeArray);
	            //}
	            //if (group.id === assistantReferee) {
	            //    let refereeArray = [];
	            //    $.each(group.subjects, function (i, user) {
	            //        let createReferee = new RefereeModel({
	            //            id: user.id,
	            //            name: (user.firstName + ' ' + user.lastName)
	            //        });
	            //        refereeArray.push(createReferee);
	            //    });
	            //    refereeListViewModel.refereeListAssistant(refereeArray);
	            //}
	            //if (group.id === fourthOfficials) {
	            //    let refereeArray = [];
	            //    $.each(group.subjects, function (i, user) {
	            //        let createReferee = new RefereeModel({
	            //            id: user.id,
	            //            name: (user.firstName + ' ' + user.lastName)
	            //        });
	            //        refereeArray.push(createReferee);
	            //    });
	            //    refereeListViewModel.refereeListFourth(refereeArray);
	            //}
	            if (group.id === MLS) {
	                let refereeArray = [];
	                $.each(group.subjects, function (i, user) {
	                    let createReferee = new RefereeModel({
	                        id: user.id,
	                        name: (user.firstName + ' ' + user.lastName)
	                    });
	                    refereeArray.push(createReferee);
	                });
	                refereeListViewModel.refereeListMLS(refereeArray);
	                //console.log(2);
	            }
	        });

	        let groupMLSReferee = refereeListViewModel.refereeListMLS();
	        let arrayCheckReferee = refereeListViewModel.setRefereeInfo();
	        arrayCheckReferee.forEach((obj, i) => {
	            let referee = obj;
	            console.log(referee);
	            groupMLSReferee.forEach((obj, i) => {
	                let allReferee = obj.id();
	                if (allReferee === referee.id) {
	                    if (referee.position === "Referee") {
	                        refereeListViewModel.selectedRefereeFullTime({ id: obj.id(), name: obj.name(), score: null, violations: null, color: null, disabled: ko.observable(true) });
	                        refereeListViewModel.updateList(obj.id(), refereeListViewModel.refereeListMLS);
	                        $(".drop-refereeFullTime").addClass("disabled");
	                    } else if (referee.position === "AR1") {
	                        refereeListViewModel.selectedRefereeAssistant({ id: obj.id(), name: obj.name(), score: null, violations: null, color: null, disabled: ko.observable(true) });
	                        refereeListViewModel.updateList(obj.id(), refereeListViewModel.refereeListMLS);
	                        $(".drop-refereeAssistant").addClass("disabled");
	                    } else if (referee.position === "AR2") {
	                        refereeListViewModel.selectedRefereeAssistantTwo({ id: obj.id(), name: obj.name(), score: null, violations: null, color: null, disabled: ko.observable(true) });
	                        refereeListViewModel.updateList(obj.id(), refereeListViewModel.refereeListMLS);
	                        $(".drop-refereeAssistantTwo").addClass("disabled");
	                    } else if (referee.position === "4th Official") {
	                        refereeListViewModel.selectedRefereeFourth({ id: obj.id(), name: obj.name(), score: null, violations: null, color: null, disabled: ko.observable(true) });
	                        refereeListViewModel.updateList(obj.id(), refereeListViewModel.refereeListMLS);
	                        $(".drop-refereeFourth").addClass("disabled");
	                    }
	                    
	                    if ($('.dropdown-toggle-a.disabled').length === 4) {
	                        $(".btn-success.control__link").addClass("disabled");
	                    }
	                }
	            });
	        });

	        //dataManager.getProReferee(1, groupId, function (proReferee) {

	        //    for (let i = 0; i < proReferee.length; i++) {
	        //        let refereeId;
	        //        subjectsInGroup.forEach((subject) => {
	        //            if (subject.firstName === proReferee[i].name.value) {
	        //                refereeId = subject.id
	        //            }
	        //        });

	        //        let newReferee = new RefereeModel({
	        //            id: refereeId,
	        //            name: (proReferee[i].name.value + ' ' + proReferee[i].firstName.value),
	        //            score: proReferee[i].score.value,
	        //            color: proReferee[i].color.value,
	        //            violations: proReferee[i].violations.value
	        //        });
	        //        userArray.push(newReferee);
	        //    }
	        //    refereeListViewModel.refereeList(userArray);

	        //    ko.applyBindings(refereeListViewModel, document.getElementById('referee-list'));
	        //});

	    });

	    function parseMatchReferee(obj) {
	        let parseMatchInfoReferee = [];
	        obj.contacts.forEach(function (i) {
	            //console.log(i.contactId);
	            if (i.contactId !== "30dee769-d11a-43ac-bade-1fdb77561537") {
	                let statusReferee;
	                if (i.data[1].lookupValues.length > 0) {
	                    statusReferee = i.data[1].lookupValues[0].value;
	                    if (statusReferee === "Accepted") {
	                        parseMatchInfoReferee.push({
	                            id: i.contactId,
	                            position: i.data[0].lookupValues[0].value,
	                            status: statusReferee
	                        })
	                    }
	                }
	            }
	            
	            //if (i.attributeDefinitionId === attributes.matchType) {
	            //    parseMatchInfo.matchType = i.lookupValues[0].value;
	            //}
	            //if (i.attributeDefinitionId === attributes.awayTeam) {
	            //    parseMatchInfo.awayTeam = i.lookupValues[0].value;
	            //}
	            //if (i.attributeDefinitionId === attributes.homeTeam) {
	            //    parseMatchInfo.homeTeam = i.lookupValues[0].value;
	            //}
	            //if (i.attributeDefinitionId === attributes.venue) {
	            //    parseMatchInfo.venue = i.lookupValues[0].value;
	            //}
	        });
	        //console.log(parseMatchInfoReferee);
	        
	        return parseMatchInfoReferee
	    }
	    

	    class RefereeModel {
	        constructor(data) {
	            let self = this;
	            self.id = ko.observable(data.id);
	            self.name = ko.observable(data.name);
	            self.score = null;// ko.observable(data.score);
	            self.violations = null;//ko.observable(data.violations);
	            self.color = null;//ko.observable(data.color);
	            self.disabled = ko.observable(false);
	        }
	    }


	    class SaveModelReferee {
	        constructor(data) {
	            let self = this;
	            self.contactId = data.id,
	            self.contactType = 1,
	            self.attachments = [],
	            self.removedData = null,
	            self.data = [
                    {
                        "attributeDefinitionId": "c72177a1-9bcf-47d9-98d4-b7363aa610cc",
                        "lookupValues": [
                            {
                                "id": data.fieldId,
                                "value": data.position,
                                "index": data.index,
                                "score" : 0
                            }
                        ]
                    },
                    {
                        "attributeDefinitionId": "a95f5777-ea33-47e5-b546-a066eacb93a5",
                        "lookupValues": []
                    }
	            ]
	        }
	    }

	    

	    class RefereeListViewModel {
	        constructor() {
	            let self = this;
	            self.refereeListFullTime = ko.observableArray();
	            self.refereeListAssistant = ko.observableArray();
	            self.refereeListFourth = ko.observableArray();
	            self.refereeListMLS = ko.observableArray();
	            self.setRefereeInfo = ko.observableArray();

	            self.selectedRefereeFullTime = ko.observable({ id: null, name: 'Select Referee', score: null, violations: null, color: null, disabled: null });
	            self.selectedRefereeAssistant = ko.observable({ id: null, name: 'Select Referee', score: null, violations: null, color: null, disabled: null });
	            self.selectedRefereeAssistantTwo = ko.observable({ id: null, name: 'Select Referee', score: null, violations: null, color: null, disabled: null });
	            self.selectedRefereeFourth = ko.observable({ id: null, name: 'Select Referee', score: null, violations: null, color: null, disabled: null });

	            self.sessionData = ko.observableArray();
	            self.selectedSession = ko.observable();

	            self.updateList = function (refereeId, refereeList) {
	                for (let i = 0; i < refereeList().length; i++) {
	                    //console.log(typeof refereeId);
	                    if (typeof refereeId === "function") {
	                        if (refereeList()[i].id() === refereeId()) {
	                            refereeList()[i].disabled(true);
	                        }
	                    } else {
	                        if (refereeList()[i].id() === refereeId) {
	                            refereeList()[i].disabled(true);
	                        }
	                    }
	                    
	                }
	                refereeList.valueHasMutated();
	            };

	            self.stopPropagationLink = (data, event) => event.stopPropagation();

	            self.saveReferee = () => {

	                let objPutReferee = {
	                    referee: (typeof self.selectedRefereeFullTime().id !== 'function') ? null : self.selectedRefereeFullTime().id(),
	                    assisstantReferee1: (typeof self.selectedRefereeAssistant().id !== 'function') ? null : self.selectedRefereeAssistant().id(),
	                    assisstantReferee2: (typeof self.selectedRefereeAssistantTwo().id !== 'function') ? null : self.selectedRefereeAssistantTwo().id(),
	                    official: (typeof self.selectedRefereeFourth().id !== 'function') ? null : self.selectedRefereeFourth().id()
	                };

	                //todo
	                let arrayContactsReferee = self.sessionData().contacts;
	                //let changeLookup = () =>  arrayContactsReferee.data[1].lookupValues = [];
	               
	                if (objPutReferee.referee) {
	                    arrayContactsReferee.push(new SaveModelReferee({
	                        id: objPutReferee.referee,
	                        position: "Referee",
	                        fieldId: "d6096824-b26d-4c32-8dda-aa5fc863d6e8",
	                        index: 0
	                    }));
	                }
	                if (objPutReferee.assisstantReferee1) {
	                    arrayContactsReferee.push(new SaveModelReferee({
	                        id: objPutReferee.assisstantReferee1,
	                        position: "AR1",
	                        fieldId: "1c08ad74-4514-46e7-9730-119f37bcf364",
	                        index: 1
	                    }));
	                }
	                if (objPutReferee.assisstantReferee2) {
	                    arrayContactsReferee.push(new SaveModelReferee({
	                        id: objPutReferee.assisstantReferee2,
	                        position: "AR2",
	                        fieldId: "e0940c08-d8ce-48ff-84b6-c8e45ef3d5c3",
	                        index: 2
	                    }));
	                }
	                if (objPutReferee.official) {
	                    arrayContactsReferee.push(new SaveModelReferee({
	                        id: objPutReferee.official,
	                        position: "4th Official",
	                        fieldId: "ef729520-4e4c-4cac-842e-693c0c915d5a",
	                        index: 3
	                    }));
	                }

	                //post data method
	                console.log(self.sessionData());
	                //console.log({
	                //    referee: (typeof self.selectedRefereeFullTime().id !== 'function') ? null : self.selectedRefereeFullTime().id(),
	                //    assisstantReferee1: (typeof self.selectedRefereeAssistant().id !== 'function') ? null : self.selectedRefereeAssistant().id(),
	                //    assisstantReferee2: (typeof self.selectedRefereeAssistantTwo().id !== 'function') ? null : self.selectedRefereeAssistantTwo().id(),
	                //    official: (typeof self.selectedRefereeFourth().id !== 'function') ? null : self.selectedRefereeFourth().id()
	                //});

	                return new Promise(function (resolve, reject) {
	                    var sessionId = self.selectedSession();
	                    var data = ko.toJSON(self.sessionData());
	                    sessionApi.putsession(sessionId, data).then((response) => {
                                console.log("Changes has been saved");
                                resolve(response);
                                window.location.replace("https://pro6252.edge10online.com/view/pro-match-list")
                            },(error) => {
                                alert(error);
                                reject(error);
                            }
                        );
	                })


	                //------notification------------
	                //let participantsList = [];
	                //typeof self.selectedRefereeFullTime().id !== 'function' ? null : participantsList.push(self.selectedRefereeFullTime().id());
	                //typeof self.selectedRefereeAssistant().id !== 'function' ? null : participantsList.push(self.selectedRefereeAssistant().id());
	                //typeof self.selectedRefereeAssistantTwo().id !== 'function' ? null : participantsList.push(self.selectedRefereeAssistantTwo().id());
	                //typeof self.selectedRefereeFourth().id !== 'function' ? null : participantsList.push(self.selectedRefereeFourth().id());

	                //dataManager.saveThread(currentMatchId, participantsList);

	                //window.location.replace("https://pro6252.edge10online.com/view/pro-match-list");
	            };

	            self.backHome = () => window.location.replace("https://pro6252.edge10online.com/view/pro-match-list");

	            //choice users
	            self.refereeChangedFullTime = (refereeId, refereeName, refereeScore, refereeViolations, refereeColor) => {
	                if (typeof self.selectedRefereeFullTime().id === 'function') {
	                    for (let i = 0; i < self.refereeListMLS().length; i++) {
	                        if (self.refereeListMLS()[i].id() === self.selectedRefereeFullTime().id()) {
	                            self.refereeListMLS()[i].disabled(false);
	                        }
	                    }
	                }
	                self.selectedRefereeFullTime({ id: refereeId, name: refereeName, score: refereeScore, violations: refereeViolations, color: refereeColor, disabled: ko.observable(true) });

	                self.updateList(refereeId, self.refereeListMLS);
	            };

	            self.refereeChangedAssistant = (refereeId, refereeName, refereeScore, refereeViolations, refereeColor) => {
	                if (typeof self.selectedRefereeAssistant().id === 'function') {
	                    for (let i = 0; i < self.refereeListMLS().length; i++) {
	                        if (self.refereeListMLS()[i].id() === self.selectedRefereeAssistant().id()) {
	                            self.refereeListMLS()[i].disabled(false);
	                        }
	                    }
	                }
	                self.selectedRefereeAssistant({ id: refereeId, name: refereeName, score: refereeScore, violations: refereeViolations, color: refereeColor, disabled: ko.observable(true) });

	                self.updateList(refereeId, self.refereeListMLS);
	            };

	            self.refereeChangedAssistantTwo = (refereeId, refereeName, refereeScore, refereeViolations, refereeColor) => {
	                if (typeof self.selectedRefereeAssistantTwo().id === 'function') {
	                    for (let i = 0; i < self.refereeListMLS().length; i++) {
	                        if (self.refereeListMLS()[i].id() === self.selectedRefereeAssistant().id()) {
	                            self.refereeListMLS()[i].disabled(false);
	                        }
	                    }
	                }
	                self.selectedRefereeAssistantTwo({ id: refereeId, name: refereeName, score: refereeScore, violations: refereeViolations, color: refereeColor, disabled: ko.observable(true) });

	                self.updateList(refereeId, self.refereeListMLS);
	            };

	            self.refereeChangedFourth = (refereeId, refereeName, refereeScore, refereeViolations, refereeColor) => {
	                if (typeof self.selectedRefereeFourth().id === 'function') {
	                    for (let i = 0; i < self.refereeListMLS().length; i++) {
	                        if (self.refereeListMLS()[i].id() === self.selectedRefereeFourth().id()) {
	                            self.refereeListMLS()[i].disabled(false);
	                        }
	                    }
	                }

	                self.selectedRefereeFourth({ id: refereeId, name: refereeName, score: refereeScore, violations: refereeViolations, color: refereeColor, disabled: ko.observable(true) });

	                self.updateList(refereeId, self.refereeListMLS);
	            };

	        }
	    }

	    ko.bindingHandlers.loadingWhen = {
	        init: function (element) {
	            LoadManager.init(element);
	        },
	        update: function (element, valueAccessor) {
	            LoadManager.update(element, valueAccessor);
	        }
	    }
	    ko.bindingHandlers.dropDownScroll = {
	        init: function (element) {
	            $(element).mCustomScrollbar({
	                axis: "y",
	                scrollButtons: {
	                    scrollSpeed: 0
	                },
	                advanced: {
	                    updateOnContentResize: true,
	                    updateOnSelectorChange: true
	                },
	                callbacks: {
	                    whileScrolling: function () {
	                        $(this).closest(".referee-list__wrapper").addClass('open');
	                    }
	                }
	            });
	        }
	    }
        
	    let refereeListViewModel = new RefereeListViewModel();
	    ko.applyBindings(refereeListViewModel, document.getElementById('referee-list'));
	    

	    
	});