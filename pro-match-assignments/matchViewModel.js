require(
    ['jquery', 'knockout', 'viewElementParametersHelper', 'EntityNavigationViewModel', 'sessionApi'],
	($, ko, viewElementParametersHelper, EntityNavigationViewModel, sessionApi) => {

	    Date.prototype.displayString = function() {
	        let date = new Date(+this);
	        let day = date.getDate().toString();
	        let month = (date.getMonth() + 1).toString();
	        return (day.length > 1 ? day : '0' + day) + '/' + (month.length > 1 ? month : '0' + month) + '/' + date.getFullYear();
	    };

	    function getParameterByName(name) {
	        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	        let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                //parse global var
                results = regex.exec(locationSearch);
	        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	    }

	    let currentMatchId = getParameterByName('matchId');

	    console.log("matchId: " + currentMatchId);
	    viewElementParametersHelper.parameters().matchId = currentMatchId;

	    let entityNavigator = EntityNavigationViewModel.getSingleton();


	    //current entity
	    entityNavigator.ready.then(function () {
	        sessionApi.getsession(currentMatchId).then((data) => {
	                //console.log(data);
	                let objDataFull = parseMatch(data)
	            //matchViewModel.sessionData(data);
	                matchViewModel.teamOne(objDataFull.homeTeam);
	                matchViewModel.teamTwo(objDataFull.awayTeam);
	                matchViewModel.matchLocation(objDataFull.venue);
	                matchViewModel.matchType(objDataFull.matchType);
	                matchViewModel.matchDate(objDataFull.matchDate);
	            }, (error) => {
	                console.warn(error);
	            }
            );
	    });

	    let attributes = {
	        matchType: '4575b5ba-82c5-4fc2-bacf-75bac90a50e7',
	        awayTeam: '126b8dac-217f-4619-b9e0-efa91e9c9b47',
	        homeTeam: 'e2e56898-14e9-4ddc-bdf9-860cd070491a',
	        venue: '2a3b89c7-8b06-4290-bd4b-1031d6b8e8c7'
	        //refereePosition: 'c72177a1-9bcf-47d9-98d4-b7363aa610cc',
	        //refereeAccept: 'a95f5777-ea33-47e5-b546-a066eacb93a5'
	    };

	    function parseMatch(obj) {
	        let parseMatchInfo = {};
	        parseMatchInfo.matchDate = new Date(obj.sessionDetails.start).displayString();
	        obj.data.forEach(function (i) {
	            if (i.attributeDefinitionId === attributes.matchType) {
	                parseMatchInfo.matchType = i.lookupValues[0].value || "-";
	            }
	            if (i.attributeDefinitionId === attributes.awayTeam) {
	                parseMatchInfo.awayTeam = i.lookupValues[0].value || "-";
	            }
	            if (i.attributeDefinitionId === attributes.homeTeam) {
	                parseMatchInfo.homeTeam = i.lookupValues[0].value || "-";
	            }
	            if (i.attributeDefinitionId === attributes.venue) {
	                parseMatchInfo.venue = i.lookupValues[0].value || "-";
	            }
	        });
	        return parseMatchInfo
	    }

	    let dataMatch = {
	        id: 1,
	        threadId: null,
            teamOne: "Some team 1",
            teamOneLogo: "../theme/defaultLogo.png",
            teamTwo: "Best team L.A.",
            teamTwoLogo: "../theme/defaultLogo.png",
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
        };

	    class MatchViewModel {
	        constructor(){
	            let self = this;
	            self.teamOne = ko.observable("Loading...");
	            self.teamOneImg = ko.observable(dataMatch.teamOneLogo);
	            self.teamTwo = ko.observable("Loading...");
	            self.teamTwoImg = ko.observable(dataMatch.teamTwoLogo);
	            self.matchLocation = ko.observable("Loading...");
	            self.matchDate = ko.observable("Loading...");
	            self.matchType = ko.observable("Loading...");
	            self.matchThread = ko.observable(dataMatch.threadId);
	            //self.sessionData = ko.observableArray();
	            
	        }
	        
	    }

	    let matchViewModel = new MatchViewModel();
	    ko.applyBindings(matchViewModel, document.getElementById('match-info'));
	});