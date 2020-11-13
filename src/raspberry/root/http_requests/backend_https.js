require('dotenv').config()

const fetch = require('node-fetch');

exports.mergeSaveStatus = (devices) => {
    fetch(process.env.MERGE_STATUS || 'https://7icqdnfk3l.execute-api.us-east-1.amazonaws.com/mergeStatus/', {
        method: 'post',
        body:    JSON.stringify(devices),
        headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(json => console.log(json));
}

exports.getAllDevices = () => {
    fetch(process.env.GET_ALL || 'https://7qgat03kv5.execute-api.us-east-1.amazonaws.com/getAllDevices/')
    .then(res => res.json())
    .then(json => console.log(json));
}

exports.deleteDevice = (device) => {
    fetch(process.env.DELETE_DEVICE || 'https://jf13ovwyif.execute-api.us-east-1.amazonaws.com/deleteDevice/', {
        method: 'delete',
        body:    JSON.stringify(device),
        headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(json => console.log(json));
}
