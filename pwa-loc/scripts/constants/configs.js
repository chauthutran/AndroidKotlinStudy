
function Configs() { };

Configs.statusOptions = [
    {
        "name": "submit",
        "label": "Sync",
        "term": "",
        "image": "images/sync.svg",
        "color": "#27AE60"
    },
    {
        "name": "submit_wMsg",
        "label": "Sync/Msg",
        "term": "",
        "image": "images/sync_msd.svg",
        "color": "#2aad5c",
        "eval": [
            { 
                "condition": "activityJson.processing.statusRead",
                "image": "images/sync_msdr.svg",
                "color": "purple",
                "onclick": "alert('do something special')"
            }
        ]
    },
    {
        "name": "queued",
        "label": "Pending",
        "term": "",
        "image": "images/sync-pending_36.svg",
        "colors": "#B1B1B1"
    },
    {
        "name": "failed",
        "label": "Sync error",
        "term": "",
        "image": "images/sync-error_36.svg",
        "colors": "#FF0000"
    },
    {
        "name": "downloaded",
        "label": "historic[1]",
        "term": "",
        "image": "images/arrow-circle-down.svg",
        "colors": "#2aad5c"
    }
];

Configs.transactionTypes = [
    {
        "name": "c_reg",
        "label": "client reg",
        "term": "",
        "comment": "",
        "dataContainer": [ "dataValues", "clientDetails" ]
    },
    {
        "name": "c_upd",
        "label": "client update",
        "term": "",
        "dataContainer": [ "dataValues" ]
    }, {
        "name": "s_ifo",
        "label": "service information",
        "term": "",
        "dataContainer": [ "dataValues" ]
    },
    {
        "name": "s_pro",
        "label": "service provision",
        "term": "",
        "dataContainer": [ "dataValues", "clientDetails" ]
    },
    {
        "name": "s_sat",
        "label": "service satisfaction",
        "term": "",
        "dataContainer": [ "dataValues" ]
    },
    {
        "name": "s_apt",
        "label": "service appointement",
        "term": "",
        "dataContainer": [ "dataValues", "clientDetails" ]
    },
    {
        "name": "v_iss",
        "label": "voucher issuing",
        "term": "",
        "dataContainer": [ "dataValues" ]
    },
    {
        "name": "v_rem",
        "label": "voucher reminder",
        "term": "",
        "dataContainer": [ "dataValues" ]
    },
    {
        "name": "v_rdx",
        "label": "voucher redeeming",
        "term": "",
        "dataContainer": [ "dataValues", "clientDetails" ]
    },
    {
        "name": "v_exp",
        "label": "voucher expired",
        "term": "",
        "dataContainer": [ "dataValues" ]
    }
];

