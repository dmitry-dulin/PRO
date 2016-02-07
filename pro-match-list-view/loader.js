define('loader', ['jquery', 'knockout'],
    function ($, ko) {
        var loadManager = new LoadManager();

        function LoadManager() {
            var self = this;
            self.init = function(element){
                var
                //cache a reference to the element as we use it multiple times below
                    $element = $(element),
                //get the current value of the css 'position' property
                    currentPosition = $element.css("position"),
                //create the new div with the 'loader' class and hide it
                    $loader = $("<div></div>").addClass("loader").hide();

                //add the loader div to the original element
                $element.append($loader);

                //make sure that we can absolutely position the loader against the original element
                if (currentPosition == "auto" || currentPosition == "static")
                    $element.css("position", "relative");

                //center the loader
                $loader.css({
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    "margin-left": -($loader.width() / 2) + "px",
                    "margin-top": -($loader.height() / 2) + "px"
                });
            };
            self.update = function(element, valueAccessor){
                var
                //unwrap the value of the flag using knockout utilities
                    isLoading = ko.utils.unwrapObservable(valueAccessor()),

                //get a reference to the parent element
                    $element = $(element),

                //get a reference to the loader
                    $loader = $element.find("div.loader");

                //get a reference to every *other* element
                $childrenToHide = $element.children(":not(div.loader)");

                //if we are currently loading...
                if (isLoading) {
                    //...hide and disable the children...
                    $childrenToHide.css("visibility", "hidden").attr("disabled", "disabled");
                    //...and show the loader
                    $loader.show();
                }
                else {
                    //otherwise, fade out the loader
                    $loader.fadeOut("fast");
                    //and re-display and enable the children
                    $childrenToHide.css("visibility", "visible").removeAttr("disabled");
                }
            };
        }

        return loadManager;

    });