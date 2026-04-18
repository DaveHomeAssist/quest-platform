(function attachMlbProductConfig(global) {
  "use strict";

  var root = global.__QUEST_PLATFORM__;
  if (!root || !root.config) {
    throw new Error("Load shared/js/core/config.js before products/mlb/config.js");
  }

  var config = root.config.createProductConfig({
    productId: "mlb",
    productCode: "BPQ",
    appName: "MLB Ballparks Quest",
    namespace: "BPQ",
    storage: {
      version: 1,
      keys: {
        visits: "visits",
        routeLegs: "routeLegs",
        activeTrip: "activeTrip",
        planningNotes: "planningNotes",
        entityScratchpads: "entityScratchpads",
        theme: "theme",
        context: "context",
        scorekeeperState: "scorekeeperState",
        scorekeeperExports: "scorekeeperExports",
        priorityTargets: "priorityTargets"
      }
    },
    entities: {
      labelSingular: "park",
      labelPlural: "parks",
      categoryField: "team",
      venueField: "roof"
    },
    schedule: {
      eventLabel: "games",
      daysAheadDefault: 21
    },
    route: {
      stopLabel: "parks",
      routeLabel: "road trip"
    },
    theme: {
      defaultTheme: "ballpark-classic",
      themeDataModule: "products/mlb/data/themes.js"
    },
    features: {
      scorekeeper: true,
      shortlist: false,
      logisticsLinks: false,
      scheduleImport: true
    },
    ui: {
      homePage: "home",
      explorerPage: "parks",
      routePage: "route",
      journalPage: "scorekeeper"
    }
  });

  root.config.registerProduct("mlb", config);
})(window);
