// -------------------------------------------
//      ConfigManager Class/Methods
//          - Loads configJson data from downloaded file or from locally retrieved 
//              and use it as main config data (in memory main place)
//          - Provides configJson related methods (Get/Set)
//
//      - FEATURES:
//          1. Place default config json parts - used if these parts json are not provided in loaded configJson
//          2. 'setConfigJson' - Used to set the downloaded/retrieved country config to main memory config.
//                  - Also keeps original configJson ('configJson_Original') downloaded/retrieved.
//          3. 'resetConfigJson' - reset is to reload the memory configJson from the original configJson.
//          4. Get related methods
//          5. Apply Defaults related methods.
//
// -------------------------------------------------

function ConfigManager() {}

ConfigManager.configJson = {};     // In memory stored configJson
ConfigManager.configJson_Original = {};  // Downloaded country PWA config original

//ConfigManager.configSetting = {}; // Not Yet coded for it.


ConfigManager.defaultActivityDisplaySettings = `'<b><i>' + INFO.activity.processing.created + '</i></b>'`;

ConfigManager.FiveYearsAgeGroups = [
    { name: '0-4',  from: 0, to: 4 },
    { name: '5-9',  from: 5, to: 9 },
    { name: '10-14', from: 10, to: 14 },
    { name: '15-19', from: 15, to: 19 },
    { name: '20-24', from: 20, to: 24 },
    { name: '25-29', from: 25, to: 29 },
    { name: '30-34', from: 30, to: 34 },
    { name: '35-39', from: 35, to: 39 },
    { name: '40+',  from: 40, to: 120 }
];

ConfigManager.TenYearsAgeGroups = [
    { name: '0-9',  from: 0, to: 9 },
    { name: '10-19',  from: 10, to: 19 },
    { name: '20-29', from: 20, to: 29 },
    { name: '30-39', from: 30, to: 39 },
    { name: '40-49', from: 40, to: 49 },
    { name: '50-59', from: 50, to: 59 },
    { name: '60-69', from: 60, to: 69 },
    { name: '70-79', from: 70, to: 79 },
    { name: '80+',  from: 80, to: 120 }
];
// -- Default Configs -----
// ----- If not on download config, place below default to 'config' json.
ConfigManager.defaultJsonList = {

   "syncDown": {
      "pathNote": "settings.sync.syncDown",
      "content": {
         "clientSearch": {
            "mainSearch_Eval": {
                  "activities": {
                     "$elemMatch": {
                        "activeUser": "INFO.login_UserName"
                     }
                  }
            },
            "dateSearch_Eval": {
                  "updated": {
                     "$gte": "INFO.dateRange_gtStr"
                  }
            }
         },
         "url": "/PWA.syncDown",
         "syncDownPoint": "login",
         "enable": true
      }
   },

   "mergeCompare": {
      "pathNote": "settings.sync.mergeCompare",
      "content": {
         "dateCompareField": [ "updated" ]
      }
   },

   "favList": {

    "online": [{
            "id": "1",
            "name": "All Contact",
            "term": "menu_list",
            "img": "images/favbar_color_act.svg",
            "style": {
                "icon": {
                    "colors": {
                        "background": "none",
                        "foreground": "#4F4F4F"
                    }
                },
                "label": {
                    "colors": {
                        "background": "#cccccc",
                        "foreground": "#000000"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList"
            }
        },
        {
            "id": "2",
            "name": "Queued",
            "term": "",
            "img": "images/favbar_color_fpl-sp.svg",
            "style": {
                "icon": {
                    "colors": {
                        "background": "none",
                        "foreground": "#008234"
                    }
                },
                "label": {
                    "colors": {
                        "background": "#cccccc",
                        "foreground": "#000000"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList",
                "options": {
                    "filter": [{
                        "status": "queued"
                    }]
                }
            }
        },
        {
            "id": "3",
            "name": "Completed",
            "term": "",
            "img": "images/favbar_color_contact.svg",
            "style": {
                "icon": {
                    "colors": {
                        "background": "none",
                        "foreground": "#ffffff"
                    }
                },
                "label": {
                    "colors": {
                        "background": "#cccccc",
                        "foreground": "#000000"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList",
                "options": {
                    "filter": [{
                        "status": "submit"
                    }]
                }
            }
        },
        {
            "id": "4",
            "name": "Entry Online only",
            "term": "menu_entry",
            "img": "images/favbar_color_fpl-fu.svg",
            "style": {
                "icon": {
                    "colors": {
                        "background": "none",
                        "foreground": "#B06068"
                    }
                },
                "label": {
                    "colors": {
                        "background": "#cccccc",
                        "foreground": "#000000"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "blockId": "blockDefaultOptionsOnline"
            }
        }
    ],
    "offline": [{
            "id": "1",
            "name": "All Contact",
            "term": "menu_list",
            "img": "images/favbar_color_act.svg",
            "style": {
                "icon": {
                    "colors": {
                        "background": "none",
                        "foreground": "#4F4F4F"
                    }
                },
                "label": {
                    "colors": {
                        "background": "#cccccc",
                        "foreground": "#000000"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList"
            }
        },
        {
            "id": "2",
            "name": "Queued",
            "term": "",
            "img": "images/favbar_color_arrows.svg",
            "style": {
                "icon": {
                    "colors": {
                        "background": "none",
                        "foreground": "#008234"
                    }
                },
                "label": {
                    "colors": {
                        "background": "#cccccc",
                        "foreground": "#000000"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList",
                "options": {
                    "filter": [{
                        "status": "queued"
                    }]
                }
            }
        },
        {
            "id": "3",
            "name": "Completed",
            "term": "",
            "img": "images/favbar_color_contact.svg",
            "style": {
                "icon": {
                    "colors": {
                        "background": "none",
                        "foreground": "#008234"
                    }
                },
                "label": {
                    "colors": {
                        "background": "#cccccc",
                        "foreground": "#000000"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList",
                "options": {
                    "filter": [{
                        "status": "submit"
                    }]
                }
            }
        },
        {
            "id": "4",
            "name": "Entry (On + Off)",
            "term": "menu_entry",
            "img": "images/favbar_color_act.svg",
            "style": {
                "icon": {
                    "colors": { "background": "none", "foreground": "#19DD89" }
                },
                "label": {
                    "colors": { "background": "#cccccc", "foreground": "#000000"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "startBlockName": "blockDefaultOptionsOffline",
                "blockId": "blockDefaultOptionsOffline"
            }
        }
    ]
    },

    "themes":[  
        {  
           "id":"default",
           "name":"default",
           "spec":{  
              "navTop":{  
                 "colors":{  
                    "background":"#ffc61d",
                    "foreground":"#101010"
                 }
              },
              "navMiddle":{  
                 "colors":{  
                    "background":"#ffda6d",
                    "foreground":"#50555a"
                 }
              },
              "button":{  
                 "colors":{  
                    "background":"#ffc61d",
                    "foreground":"#333333"
                 }
              }
           }
        },
        {  
           "id":"opule",
           "name":"opule",
           "spec":{  
              "navTop":{  
                 "colors":{  
                    "background":"#00ACC1",
                    "foreground":"#ffffff"
                 }
              },
              "navMiddle":{  
                 "colors":{  
                    "background":"#0093A3",
                    "foreground":"#333333"
                 }
              },
              "button":{  
                 "colors":{  
                    "background":"#0093A3",
                    "foreground":"#ffffff"
                 }
              }
           }
        },
        {  
           "id":"ocean",
           "name":"ocean",
           "spec":{  
              "navTop":{  
                 "colors":{  
                    "background":"#8DC9F7",
                    "foreground":"#E5EBEB"
                 }
              },
              "navMiddle":{  
                 "colors":{  
                    "background":"#059ADC",
                    "foreground":"#FFFFFF"
                 }
              },
              "button":{  
                 "colors":{  
                    "background":"#059ADC",
                    "foreground":"#F8FAF5"
                 }
              }
           }
        }
     ]    
};

ConfigManager.default_SettingPaging = { 
    "enabled": false,
    "pagingSize": 9 // 'pagingSize': ( $( '#pageDiv' ).height() / 90 ) --> 90 = standard height for 1 activityCard
};


ConfigManager.periodSelectorOptions = {
    "all": {
        "name": "All periods",
        "term": "",
        "from": "rangeFrom",
        "to": "rangeTo",
        "enabled": "true"
    },
    "today": {
        "name": "today",
        "term": "",
        "from": "new Date().toISOString().split( 'T' )[ 0 ]",
        "to": "new Date().toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "24hours": {
        "name": "last 24 hours",
        "term": "",
        "from": "new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]+'T'+new Date().toISOString().split( 'T' )[ 1 ]",
        "to": "new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0]+'T'+new Date().toISOString().split( 'T' )[ 1 ]",
        "enabled": "false"
    },
    "last3Days": {
        "name": "last 3 Days",
        "term": "",
        "from": "new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0]",
        "to": "new Date().toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "last7Days": {
        "name": "last 7 Days",
        "term": "",
        "from": "new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0]",
        "to": "new Date().toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "thisWeek": {
        "name": "this Week",
        "term": "",
        "from": "new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split('T')[0]",
        "to": "new Date(new Date().setDate(new Date().getDate() - new Date().getDay()+6)).toISOString().split('T')[0]",
        "enabled": "true"
    },
    "lastWeek": {
        "name": "last Week",
        "term": "",
        "from": "new Date(new Date().setDate(new Date().getDate() - new Date().getDay()-7)).toISOString().split('T')[0]",
        "to": "new Date(new Date().setDate(new Date().getDate() - new Date().getDay()-1)).toISOString().split('T')[0]",
        "enabled": "true"
    },
    "thisMonth": {
        "name": "this Month",
        "term": "",
        "from": "new Date(new Date().getFullYear(), new Date().getMonth(), 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "true"
    },
    "lastMonth": {
        "name": "last Month",
        "term": "",
        "from": "new Date(new Date().getFullYear(), new Date().getMonth() - 1, 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), new Date().getMonth() + 0, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "true"
    },
    "thisPaymentPeriod": {
        "name": "this Payment Period",
        "term": "",
        "from": "new Date(new Date().getFullYear(), new Date().getMonth() - 1, 22).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), new Date().getMonth(), 21).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "lastPaymentPeriod": {
        "name": "last Payment Period",
        "term": "",
        "from": "new Date(new Date().getFullYear(), new Date().getMonth() - 2, 22).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), new Date().getMonth() - 1, 21).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "thisQuarter": {
        "name": "this Quarter",
        "term": "",
        "from": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3, 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3 + 3, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "lastQuarter": {
        "name": "last Quarter",
        "term": "",
        "from": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3 - 3, 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "last3Months": {
        "name": "last 3 Months",
        "term": "",
        "from": "new Date(new Date().getFullYear(), new Date().getMonth() - 2, 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "last6Months": {
        "name": "last 6 Months",
        "term": "",
        "from": "new Date(new Date().getFullYear(), new Date().getMonth() - 5, 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "thisYear": {
        "name": "this Year",
        "term": "",
        "from": "new Date(new Date().getFullYear(), 0, 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear()+1, 0, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "true"
    },
    "lastYear": {
        "name": "last Year",
        "term": "",
        "from": "new Date(new Date().getFullYear()-1, 0, 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), 0, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    }
};

ConfigManager.statisticConfig = { 
    "statsPageContent": [
        "<div id='statsContent'>",
        "  <div class='statDiv' statId='uniqueRegistrations'></div>",
        "  <div class='statDiv' statId='vouchersIssued'></div>",
        "  <div class='statDiv' statId='totalVisits'></div>",
        "  <div class='statDiv' statId='returningClients'></div>",
        "  <div class='statDiv' statId='regByAge'></div>",
        "  <div class='statDiv' statId='regByActivityType'></div>",
        "  <div class='statDiv' statId='regByActivityTypeByAge'></div>",
        "  <div class='statDiv' statId='regByActivityTypeByServiceByAge'></div>",
        "  <div class='statDiv' statId='regByActivityTypeByFullDateByAge'></div>",
        "  <div class='statDiv' statId='regByActivityTypeByAgePivot'></div>",
        "  <div class='statDiv' statId='regByActivityTypeBytransactionYearMonthPivot'></div>",
        "</div>"
    ],
    "statsList": {
        "uniqueRegistrations": {
            "sequentialEval": "true",
            "runDataEval": [
                " me.addTitle( 'Unique Clients Registrations', 'consult' ); ", 
                " console.log( 'uniqueRegistrations', INFO.data.c_reg ); ",
                " me.addTag( INFO.data.c_reg.length, 'uniqueRegistrations', 'h3', 'blockDigit' ); "
            ]
        },
        "vouchersIssued": {
            "sequentialEval": "true",
            "runDataEval": [
                " me.addTitle( 'Vouchers Issued ', 'details' ); ", 
                " console.log( 'vouchersIssued', INFO.data.v_iss, INFO.data.v_iss.length ); ",
                " me.addTag( INFO.data.v_iss.length, 'vouchersIssued', 'h3', 'blockDigit' ); "
            ]
        },
        "totalVisits": {
            "sequentialEval": "true",
            "runDataEval": [
                " me.addTitle( 'Total Visits', 'activities' ); ", 
                " console.log( 'totalVisits', ActivityDataManager._activityList ); ",
                " me.addTag( ActivityDataManager._activityList.length, 'totalVisits', 'h3', 'blockDigit' ); "
            ]
        },
        "returningClients": {
            "sequentialEval": "true",
            "runDataEval": [
                " me.addTitle( 'Returning Clients', 'table' ); ", 
                " me.addTag( INFO.data.s_pro.length + INFO.data.s_apt.length , 'returningClients', 'h3', 'blockDigit' ); "
            ]
        },
        "regByAge": {
            "sequentialEval": "true",
            "runDataEval": [
                " me.addTitle( 'Registrations by Age', 'table' ); ", 
                " console.log( 'Registrations by Age' ); ",
                " console.log( me.groupBy( INFO.data.c_reg, [ 'age' ] ) ); ",
                " me.addDimensionTable( me.groupBy( INFO.data.c_reg, [ 'age' ] ), 'regByAge' ); ",
            ]

        },
        "regByActivityType": {
            "sequentialEval": "true",
            "runDataEval": [
                " me.addTitle( 'Registrations by activityType', 'table' ); ", 
                " console.log( 'Registrations by activityType' ); ",
                " console.log( me.groupBy( INFO.data.c_reg, [ 'activityType' ] ) ); ",
                " me.addDimensionTable( me.groupBy( INFO.data.c_reg, [ 'activityType' ] ), 'regByActivityType' ); ",
            ]

        },
        "regByActivityTypeByAge": {
            "sequentialEval": "true",
            "runDataEval": [
                " me.addTitle( 'Registrations by activityType+age', 'table' ); ", 
                " console.log( 'Registrations by activityType+age' ); ",
                " console.log( me.groupBy( INFO.data.c_reg, [ 'activityType', 'age' ] ) ); ",
                " me.addTable( me.groupBy( INFO.data.c_reg, [ 'activityType', 'age' ] ), 'regByActivityTypeByAge' ); ",
            ]

        },
        "regByActivityTypeByServiceByAge": {
            "sequentialEval": "true",
            "runDataEval": [
                " me.addTitle( 'PARTIAL DATASET ERROR: Registrations by activityType+program+age', 'table' ); ", 
                " console.log( 'Registrations by activityType+program+age' ); ",
                " console.log( me.groupBy( INFO.data.c_reg, [ 'program', 'activityType', 'age' ] ) ); ",
                " me.addTable( me.groupBy( INFO.data.c_reg, [ 'program', 'activityType', 'age' ] ), 'regByActivityTypeByServiceByAge' ); ",
            ]

        },
        "regByActivityTypeByFullDateByAge": {
            "sequentialEval": "true",
            "runDataEval": [
                " me.addTitle( 'Registrations by activityType+transactionYearMonth+age', 'table' ); ", 
                " console.log( 'Registrations by activityType+program+age' ); ",
                " console.log( me.groupBy( INFO.data.c_reg, [ 'transactionYear', 'transactionYearMonth', 'activityType', 'age' ] ) ); ",
                " me.addTable( me.groupBy( INFO.data.c_reg, [ 'transactionYear', 'transactionYearMonth', 'activityType', 'age' ] ), 'regByActivityTypeByFullDateByAge' ); ",
            ]
        },
        "regByActivityTypeByAgePivot": {
            "sequentialEval": "true",
            "runDataEval": [
                " me.addTitle( 'Registrations by ActivityType + Age: PIVOT', 'table' ); ", 
                " console.log( 'regByActivityTypeByAgePivot' ); ",
                " console.log( me.createGroup( INFO.data.c_reg, 'age', 'ageGroup5', ConfigManager.FiveYearsAgeGroups ) ); ",
                " me.pivotTable( me.pivot( me.groupBy( INFO.data.c_reg, [ 'activityType', 'ageGroup5' ] ), 'ageGroup5', 'activityType', 'count' ), 'regByActivityTypeByAgePivot' ); ",
            ]

        },
        "regByActivityTypeBytransactionYearMonthPivot": {
            "sequentialEval": "true",
            "runDataEval": [
                " me.addTitle( 'Registrations by ActivityType + transactionYearMonth: PIVOT', 'table' ); ", 
                " console.log( 'regByActivityTypeBytransactionYearMonthPivot' ); ",
                " console.log( me.pivot( me.groupBy( INFO.data.c_reg, [ 'activityType', 'transactionYearMonth' ] ), 'transactionYearMonth', 'activityType', 'count' ) ); ",
                " me.pivotTable( me.pivot( me.groupBy( INFO.data.c_reg, [ 'activityType', 'transactionYearMonth' ] ), 'transactionYearMonth', 'activityType', 'count' ), 'regByActivityTypeBytransactionYearMonthPivot' ); ",
                " me.createGroup( INFO.data.c_reg, 'age', 'ageGroup10', ConfigManager.TenYearsAgeGroups ); ",
                " me.addTitle( 'Another PIVOT', 'table' ); ", 
                " me.pivotTable( me.pivot( me.groupBy( INFO.data.c_reg, [ 'activityType', 'ageGroup10' ] ), 'activityType', 'ageGroup10', 'count' ), 'regByActivityTypeBytransactionYearMonthPivot' ); ",
            ]

        }
    }
};

ConfigManager.statisticConfig2 = { 
    "statsPageContent": [
        "<div id='statsContent'>",
        "  <div class='statDiv' statId='byYearTable'></div>",
        "  <div class='statDiv' statId='periodTotal'></div>",
        "  <div class='statDiv' statId='allTotal'></div>",
        "</div>"
    ],
    "statsList": {
        "byYearTable": {
            "periodType": "relational",
            "runDataEval": [
                " var cf = crossfilter([ ",
                "    { Country: 'Brazil', Year: 1986, DMFT: 6.7 }, ",
                "    { Country: 'Brazil', Year: 1994, DMFT: 4.9 }, ",
                "    { Country: 'Canada', Year: 1974, DMFT: 4.4 } ",
                " ]); ",

                " var cf_year = cf.dimension( function(d) { return d.Year; } ); ",
            
                " INFO.toTable( INFO.statChartTag, cf_year.filterRange( [ INFO.startPeriod, INFO.endPeriod ] ).top( Infinity ) ); "
            ],
            "divContent": [
                "<div>---Table---</div>",
                "<div>",
                " displaying table content: <br>",
                " <div class='statChart'></div>",
                "</div>"
            ]
        },
        "allTotal": {
            "periodType": "static",
            "runDataEval": [
                " var cf = crossfilter([ ",
                "    { Country: 'Brazil', Year: 1986, DMFT: 6.7 }, ",
                "    { Country: 'Brazil', Year: 1994, DMFT: 4.9 }, ",
                "    { Country: 'Canada', Year: 1974, DMFT: 4.4 } ",
                " ]); ",

                " var cf_year = cf.dimension( function(d) { return d.Year; } ); ",
            
                " INFO.statChartTag.html( cf_year.groupAll().reduceSum( function(d) { return d.DMFT; } ).value() ); "
            ],
            "divContent": [
                "<div>------</div>",
                "<div>All Year Total: <div class='statChart'></div>",
                "</div>"
            ]

        },
        "periodTotal": {
            "periodType": "relational",
            "runDataEval": [
                " var cf = crossfilter([ ",
                "    { Country: 'Brazil', Year: 1986, DMFT: 6.7 }, ",
                "    { Country: 'Brazil', Year: 1994, DMFT: 4.9 }, ",
                "    { Country: 'Canada', Year: 1974, DMFT: 4.4 } ",
                " ]); ",

                " var cf_year = cf.dimension( function(d) { return d.Year; } ); ",
            
                " var filtered = cf_year.filterRange( [ INFO.startPeriod, INFO.endPeriod ] ); ",

                " INFO.statChartTag.html( INFO.getListSum( filtered.top( Infinity ), 'DMFT' ) ); ",

                " /* filtered.groupAll().reduceSum( function(d) { return d.DMFT; } ).value() */"
            ],
            "divContent": [
                "<div>------</div>",
                "<div>Period Total: <div class='statChart'></div>",
                "</div>"
            ]

        }
    },
    "chartMethods": [
        " INFO.toTable = function( tableTag, json ) { ",
        "    var html = ''; ",

        "    json.forEach(function(row) { ",
        "        html += '<tr>'; ",
        "        var dataStr = ''; ",
        
        "        for ( key in row ) { ",
        "              html += '<td>' + row[key] + '</td>'; ",
        
        "              dataStr += row[key] + ', '; ",
        "        }; ",
        
        "        console.log( dataStr ); ",
        "        html += '</tr>'; ",
        "    }); ",
        
        "    tableTag.html( '<table>' + html + '</table>' ); ",
        " }; ",

        " INFO.getListSum = function( list, prop ) { ",
        "    var total = 0; ",
        "    list.forEach(function(item) { ",
        "       if ( item[prop] ) total += Number( item[prop] ); ",
        "    }); ",
        "    return total; ",
        " }; "
    ]
};


//   " toTable( INFO.divStatChartTag, cf_year.filterRange( [ INFO.startPeriod, INFO.endPeriod ] ).top( Infinity ) ); "


// ==== Methods ======================

ConfigManager.setConfigJson = function ( configJson ) 
{
    try
    {
        if ( configJson )
        {
            ConfigManager.configJson_Original = configJson; 
    
            ConfigManager.configJson = Util.getJsonDeepCopy( ConfigManager.configJson_Original );
        
            ConfigManager.applyDefaults( ConfigManager.configJson, ConfigManager.defaultJsonList );
        }    
    }
    catch ( errMsg )
    {
        console.log( 'Error in ConfigManager.setConfigJson, errMsg: ' + errMsg );
    }
};

// NOTE: We can override any config setting by modifying 'ConfigManager.configJson' in console.


ConfigManager.resetConfigJson = function () 
{
    ConfigManager.setConfigJson( ConfigManager.configJson_Original );
};

ConfigManager.clearConfigJson = function () 
{
    ConfigManager.configJson = {};
    //ConfigManager.configSetting = {};
};

// ------------------------------------
// --- 'Get' related methods

ConfigManager.getConfigJson = function () 
{
    return ConfigManager.configJson;
};  

ConfigManager.getAreaListByStatus = function( bOnline, callBack )
{
    var configJson = ConfigManager.getConfigJson();

    ConfigManager.configUserRole( function()
    {
         var compareList = ( bOnline ) ? configJson.areas.online : configJson.areas.offline;
         var retAreaList = [];

         for ( var i=0; i< compareList.length; i++ )
         {
            if ( compareList[ i ].userRoles )
            {
                for ( var p=0; p< compareList[ i ].userRoles.length; p++ )
                {
                    if ( FormUtil.login_UserRole.includes( compareList[ i ].userRoles[ p ]  ) )
                    {
                        retAreaList.push( compareList[ i ] );
                        break;
                    }
                }
            }
            else
            {
                retAreaList.push( compareList[ i ] );
            }
         }

        if ( callBack ) callBack( retAreaList );

    } );

};

ConfigManager.getAllAreaList = function()
{
    var combinedAreaList = [];

    return combinedAreaList.concat( ConfigManager.configJson.areas.online, ConfigManager.configJson.areas.offline );
};

ConfigManager.configUserRole = function( callBack )
{
    var defRoles = ConfigManager.configJson.definitionUserRoles;
    var userGroupRole = SessionManager.sessionData.orgUnitData.orgUnit.organisationUnitGroups;

    if ( defRoles && userGroupRole )
    {
        for ( var r=0; r< userGroupRole.length; r++ )
        {
            for ( var i=0; i< defRoles.length; i++ )
            {
                if ( defRoles[ i ].uid == userGroupRole[ r ].id )
                {
                    FormUtil.login_UserRole.push( defRoles[ i ].uid );
                }
            }
        }

        if ( callBack ) callBack();
    }
    else
    {
        FormUtil.login_UserRole = [];
        if ( callBack ) callBack();
    }

};

// ----------------------------------------
        
ConfigManager.getSettingPaging = function()
{
    var pagingSetting;

    var configJson = ConfigManager.getConfigJson();

    if ( configJson && configJson.settings && configJson.settings.paging )
    {
        pagingSetting = configJson.settings.paging;
    }
    else
    {
        pagingSetting = ConfigManager.default_SettingPaging;
    }
    
    return pagingSetting;
}

ConfigManager.getActivityDisplaySettings = function()
{
    var configJson = ConfigManager.getConfigJson();

    var displaySettings = [  
      ConfigManager.defaultActivityDisplaySettings 
    ];

    // `'<b><i>' + INFO.processing.created + '</i></b>'`;
    // "'<b><i>' + activityItem.created + '</i></b>'"

    try
    {
        if ( configJson.settings 
            && configJson.settings.redeemDefs
            && configJson.settings.redeemDefs.displaySettings )
        {
            displaySettings = configJson.settings.redeemDefs.displaySettings;
        }
    }
    catch ( errMsg )
    {
        console.log( 'Error in ConfigManager.getActivityDisplaySettings, errMsg: ' + errMsg );
    }


    return displaySettings;
};


ConfigManager.getActivitySyncUpStatusConfig = function( activityJson )
{
    var activityStatusConfig;
    var configJson = ConfigManager.getConfigJson();

	try
	{        
        if ( activityJson.processing )
        {
            activityStatusConfig = Util.getFromList( configJson.settings.redeemDefs.statusOptions, activityJson.processing.status, 'name' );
        }
	}
	catch ( errMsg )
	{
		console.log( 'Error on ConfigManager.getActivitySyncUpStatusConfig, errMsg: ' + errMsg );
    }
    
    return activityStatusConfig;
};


ConfigManager.getActivityTypeConfig = function( activityJson )
{
	var activityTypeConfig;
   var configJson = ConfigManager.getConfigJson();

    try
	{
        activityTypeConfig = Util.getFromList( configJson.settings.redeemDefs.activityTypes, activityJson.type, 'name' );

        // Removed - if matching acitivity type config does not exists, compose activity type based on 'program'..
        // FormUtil.getActivityTypeComposition = function( itemData )
	}
	catch ( errMsg )
	{
		console.log( 'Error on ConfigManager.getActivityTypeConfig, errMsg: ' + errMsg );
    }
    
    return activityTypeConfig;
};


ConfigManager.getSyncMergeDatePaths = function()
{
   var configJson = ConfigManager.getConfigJson();

   return configJson.settings.sync.mergeCompare.dateCompareField; // var pathArr = 
};


ConfigManager.getSyncDownSetting = function()
{
   return ConfigManager.getConfigJson().settings.sync.syncDown;
};


// ------------------------------------------------------
// -- Apply Defaults related methods.

ConfigManager.applyDefaults = function( configJson, defaults )
{
   ConfigManager.applyDefault_syncDown( configJson, defaults.syncDown );

   ConfigManager.applyDefault_mergeCompare( configJson, defaults.mergeCompare );

   // Other defaults could be placed here..
   ConfigManager.applyDefault_favList( configJson, defaults.favList );

   ConfigManager.applyDefault_themes( configJson, defaults.themes );

};

ConfigManager.applyDefault_syncDown = function( configJson, syncDownJson )
{
   if ( syncDownJson )
   {
      // 1. Check if 'configJson' has the content in path.
      //    If not exists, set the 'content' of json..
      if ( !configJson.settings ) configJson.settings = {};
      if ( !configJson.settings.sync ) configJson.settings.sync = {};

      if ( !configJson.settings.sync.syncDown ) configJson.settings.sync.syncDown = Util.getJsonDeepCopy( syncDownJson.content );
   }
};


// TODO: Change to 'mergeCompare'
ConfigManager.applyDefault_mergeCompare = function( configJson, mregeCompareJson )
{
   if ( mregeCompareJson )
   {
      // 1. Check if 'configJson' has the content in path.
      //    If not exists, set the 'content' of json..
      if ( !configJson.settings ) configJson.settings = {};
      if ( !configJson.settings.sync ) configJson.settings.sync = {};

      if ( !configJson.settings.sync.mregeCompare ) configJson.settings.sync.mregeCompare = Util.getJsonDeepCopy( mregeCompareJson.content );
   }
};


ConfigManager.applyDefault_favList = function( configJson, favListJson )
{
   if ( favListJson )
   {
      if ( !configJson.favList ) configJson.favList = Util.getJsonDeepCopy( favListJson );
   }
};


ConfigManager.applyDefault_themes = function( configJson, themesJsonArr )
{
   if ( themesJsonArr )
   {
      if ( !configJson.themes ) configJson.themes = themesJsonArr;
   }
};

// ========================================================


// ==================================================
