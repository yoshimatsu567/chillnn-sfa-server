/**
 * @alert
 * 許可なく書き換えない
 */
module.exports = (resource, logicalId) => {
    console.log(`[split-stacks]\nlogicalId => ${logicalId}\nresource => ${JSON.stringify(resource)}`);
    // =============== AppSync ===============
    if (/sfa(.*)user(.*)GraphQl/.test(logicalId)) {
        return {
            destination: 'AppSyncUser',
            allowSuffix: true,
            // force: true,
        };
    }
};
