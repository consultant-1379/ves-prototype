const relativeDistiguishedNameRe = /=(.*?)(,|$)/
const relativeDistiguishedNameType = /(.*,)(.*)=/ //Find the last parameter from MO

function getRdnFromMo(eriManagObject) {
    var result = eriManagObject.match(relativeDistiguishedNameRe);
    // return the value in the parenthese of regex
    if (result === null) {
        return eriManagObject;
    }
    else {
        return result[1];
    }
}

function getRdnFromMoType(eriManagObject) {
    var result = eriManagObject.match(relativeDistiguishedNameType);
    // return the value in the parenthese of regex
    if (result === null) {
        return eriManagObject;
    }
    else {
        return result[2];
    }
}

module.exports = {
    getRdnFromMo: getRdnFromMo,
    getRdnFromMoType: getRdnFromMoType
}