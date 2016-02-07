require(
    ['jquery', 'knockout', 'loader', 'dataManager', 'EntityNavigationViewModel', 'entityApi', 'viewElementParametersHelper', 'moment', 'sessionApi', 'commentApi'],
	($, ko, LoadManager, DataManager, EntityNavigationViewModel, entityApi, viewElementParametersHelper, moment, sessionApi, commentApi) => {

	    let pageParamsHelper = viewElementParametersHelper.parameters();
	    //let dataManager = DataManager.create();
	    let entityNavigator = EntityNavigationViewModel.getSingleton();

	    let dataList = [
            {
                id: 1,
                threadId: null,
                teamOne: "Some team 1",
                teamOneLogo: "somepath/1.jpg",
                teamTwo: "Best team L.A.",
                teamTwoLogo: "somepath/2.jpg",
                matchType: "Excellent type",
                date: new Date(2015, 11, 31),
                location: "N.Y. Stadium",
                assigned: false,
                color: "red",
                isVisibleInfo: ko.observable(false),
                gameData: [
                    {
                        refereePosition: "Referee",
                        status: "Assigned",
                        statusColor: "green",
                        name: "Dwaine Jonson",
                        accept: "some value"
                    },
                    {
                        refereePosition: "Assistant Referee",
                        status: "Not assigned",
                        statusColor: "red",
                        name: "Terry Hogan",
                        accept: "some outher value"
                    },
                    {
                        refereePosition: "4th official",
                        status: "Assigned",
                        statusColor: "green",
                        name: "Kerry King",
                        accept: "some next value"
                    },
                ]
            },
            {
                id: 2,
                threadId: null,
                teamOne: "London monsters",
                teamOneLogo: "somepath/1.jpg",
                teamTwo: "Best team NY",
                teamTwoLogo: "somepath/2.jpg",
                matchType: "Another type",
                date: new Date(2015, 11, 30),
                location: "N.Y. Small Stadium",
                assigned: true,
                color: "green",
                isVisibleInfo: ko.observable(false),
                gameData: [
                    {
                        refereePosition: "Referee",
                        status: "Assigned",
                        statusColor: "green",
                        name: "Dwaine Jonson",
                        accept: "some value"
                    },
                    {
                        refereePosition: "Assistant Referee",
                        status: "Not assigned",
                        statusColor: "red",
                        name: "Terry Hogan",
                        accept: "some outher value"
                    },
                    {
                        refereePosition: "4th official",
                        status: "Assigned",
                        statusColor: "green",
                        name: "Kerry King",
                        accept: "some next value"
                    },
                ]
            },
            {
                id: 3,
                threadId: null,
                teamOne: "London monsters",
                teamOneLogo: "somepath/1.jpg",
                teamTwo: "Best team NY",
                teamTwoLogo: "somepath/2.jpg",
                matchType: "Another type",
                date: new Date(2016, 0, 19),
                location: "N.Y. Small Stadium",
                assigned: false,
                color: "amber",
                isVisibleInfo: ko.observable(false),
                gameData: [
                    {
                        refereePosition: "Referee",
                        status: "Assigned",
                        statusColor: "green",
                        name: "Dwaine Jonson",
                        accept: "some value"
                    },
                    {
                        refereePosition: "Assistant Referee",
                        status: "Not assigned",
                        statusColor: "red",
                        name: "Terry Hogan",
                        accept: "some outher value"
                    },
                    {
                        refereePosition: "4th official",
                        status: "Assigned",
                        statusColor: "green",
                        name: "Kerry King",
                        accept: "some next value"
                    },
                ]
            },
            {
                id: 4,
                threadId: null,
                teamOne: "London monsters",
                teamOneLogo: "somepath/1.jpg",
                teamTwo: "Best team NY",
                teamTwoLogo: "somepath/2.jpg",
                matchType: "Another type",
                date: new Date(2016, 0, 19),
                location: "N.Y. Small Stadium",
                assigned: false,
                color: "amber",
                isVisibleInfo: ko.observable(false),
                gameData: [
                    {
                        refereePosition: "Referee",
                        status: "Assigned",
                        statusColor: "green",
                        name: "Dwaine Jonson",
                        accept: "some value"
                    },
                    {
                        refereePosition: "Assistant Referee",
                        status: "Not assigned",
                        statusColor: "red",
                        name: "Terry Hogan",
                        accept: "some outher value"
                    },
                    {
                        refereePosition: "4th official",
                        status: "Assigned",
                        statusColor: "green",
                        name: "Kerry King",
                        accept: "some next value"
                    },
                ]
            },
	    ];

	    class MatchListViewModel {
	        constructor() {
	            let self = this;
	            self.matchList = ko.observableArray();
	            self.acceptedCount = ko.observable();
	            self.rejectedCount = ko.observable();
	            self.pendingCount = ko.observable();
	            self.refereesList = ko.observableArray();
	            self.currentUserId = ko.observable(null);
	            self.currentUserType = ko.observable(null);
	            self.isRefeeryRole = ko.observable();
	            self.matchListCount = ko.pureComputed(() => {
	                return self.matchList().length;
	            }, self);

	            //subscribes
	            self.matchList.subscribe(() => {
	                self.acceptedCount(findCount('accepted', self.matchList(), true));
	                self.rejectedCount(findCount('accepted', self.matchList(), false));
	                self.pendingCount((self.matchList().length - self.acceptedCount()) - self.rejectedCount());
	            });
	            self.refereesList.subscribe(() => {
	                if (typeof self.currentUserId() != 'undefined') {
	                    self.isRefeeryRole(true);
	                }
	            });
	            self.currentUserId.subscribe(() => {
	                if (self.refereesList().length) {
	                    self.isRefeeryRole(false);
	                }
	            });

	            self.setAccept = (match) => {
	                // TODO: add ajax request and set CONST data   

	                let rowStatusObj = {
	                    "id": "3428d41a-f704-4dc7-9ffd-70a21ba151f2",
	                    "value": "Accepted",
	                    "index": 1,
	                    "score": 0
	                },
                    currentReferee = self.currentUserId();

	                return new Promise(function (resolve, reject) {
	                    sessionApi.getsession(match.id).then((data) => {
	                        data.contacts.forEach((referee) => {
	                            if (referee.contactId === currentReferee) {
	                                referee.data[1].lookupValues.push(rowStatusObj)
	                            }
	                        });
	                        let dataJSON = ko.toJSON(data);
	                        sessionApi.putsession(match.id, dataJSON).then((response) => {
	                                console.log("Changes has been saved");
                                    

                                    // view changes
	                                match['accepted'](true);
	                                match['gameData'].forEach(function (item) {
	                                    if (item['id'] == match['refereeId']) {
	                                        item['accept']("Accepted");
	                                    }
	                                })
	                                self.matchList.valueHasMutated();
	                                // view changes

	                                resolve(response);
	                            },
                                (error) => {
	                                alert("Bad Request PUT");
	                                reject(error);
	                            }
                            );
	                    }, (error) => {
	                        alert("Bad Request GET");
	                        console.warn(error);
	                    }
                       );
	                })

	            }

	            self.setReject = (match) => {
	                let rowStatusObj = {
	                    "id": "3b9d3b0e-f1f4-4fe8-b33d-1aefb2081dfe",
	                    "value": "Rejected",
	                    "index": 2,
	                    "score": 0
	                },
                    currentReferee = self.currentUserId();

	                return new Promise(function (resolve, reject) {
	                    sessionApi.getsession(match.id).then((data) => {
	                        data.contacts.forEach((referee) => {
	                            if (referee.contactId === currentReferee) {
	                                referee.data[1].lookupValues.push(rowStatusObj)
	                            }
	                        });
	                        let dataJSON = ko.toJSON(data);
	                        sessionApi.putsession(match.id, dataJSON).then((response) => {
	                            console.log("Changes has been saved");

	                            // view changes
	                            match['accepted'](false);
	                            match['gameData'].forEach(function (item) {
	                                if (item['id'] == match['refereeId']) {
	                                    item['accept']("Rejected");
	                                }
	                            })
	                            self.matchList.valueHasMutated();
	                            // view changes

	                            resolve(response);
	                        }, (error) => {
	                            alert("Bad Request PUT");
	                            reject(error);
	                        }
                               );
	                    }, (error) => {
	                        alert("Bad Request GET");
	                        console.warn(error);
	                    }
                           );
	                })
	            };

	        }

	        toggleTableVisible(item) {
	            item.isVisibleInfo() == true ? item.isVisibleInfo(false) : item.isVisibleInfo(true);
	        }
	    }

	    function checkIsRefeery(refeeryArray, userId) {
	        let result = false;
	        refeeryArray.forEach((item) => {
	            if (item['id'] == userId) {
	                result = true;
	            }
	        });
	        return result;
	    }

	    function findCount(prop, arr, value) {
	        return arr.filter((item) => {
	            return item[prop]() == value;
	        }).length;
	    }

	    function setAnswer(match, value) {
	        console.log(match);
	        console.log(value);
	    }

	    ko.bindingHandlers.loadingWhen = {
	        init: (element) => {
	            LoadManager.init(element);
	        },
	        update: (element, valueAccessor) => {
	            LoadManager.update(element, valueAccessor);
	        }
	    }


	    let matchListViewModel = new MatchListViewModel();

	    

	    //current entity
	    entityNavigator.ready.then(() => {
	        let userEntity = entityNavigator.currentEntity();
	        let userData = userEntity.data;
	        let userId = userData.id;
	        let entityType = userEntity.entityType;


	        matchListViewModel.currentUserId(userId);
	        matchListViewModel.currentUserType(entityType);

	        DataManager.getProMatches(entityType, userId, function (data) {
	            //console.log(data);
	            matchListViewModel.matchList(data);
	        });



	    });

	    ko.applyBindings(matchListViewModel, document.getElementById('match-list'));

	});