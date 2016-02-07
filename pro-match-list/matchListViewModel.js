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
	            self.assignedCount = ko.observable();
	            self.unnassignedCount = ko.observable();
	            self.refereesList = ko.observableArray();
	            self.currentUserId = ko.observable(null);
	            self.currentUserType = ko.observable(null);
	            self.isRefeeryRole = ko.observable();
	            self.matchListCount = ko.pureComputed(() => {
	                return self.assignedCount() + self.unnassignedCount();
	            }, self);

	            //subscribes
	            self.matchList.subscribe(() => {
	                self.assignedCount(findCount('assigned', self.matchList()));
	                self.unnassignedCount(self.matchList().length - self.assignedCount());
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

	    function findCount(prop, arr) {
	        return arr.filter((item) => {
	            return item[prop] == true;
	        }).length;
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
	            //viewModel.dataLoader(false);
	            //viewModel.data(weeklyTesting);
	            //viewModel.isVisible(weeklyTesting.length > 0);
	            //console.log(data);
	            console.log(data);
	            matchListViewModel.matchList(data);

	        });



	    });

	    ko.applyBindings(matchListViewModel, document.getElementById('match-list'));

	});