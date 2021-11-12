/* 
    args
    {
        GiftItemId: xxx,
        GiftItemAmount: n
    }
*/
handlers.QueueGiftToUser  = function (args, context)
{
    try
    {
        let logMessage = ``;
        logMessage = `QueueGiftToUser::args: ${JSON.stringify(args)}`;
        log.info(logMessage);

        let ServerGiftQueue = CloudScriptLib.getUserData(["GiftQueue"]);
        logMessage = `QueueGiftToUser::GiftQueue: ${JSON.stringify(GiftQueue)}`;
        log.info(logMessage);

        let GiftQueue = [];
        if (ServerGiftQueue.Data.GiftQueue !== undefined
            && ServerGiftQueue.Data.GiftQueue.Value !== undefined)
            GiftQueue = ServerGiftQueue.Data.GiftQueue.Value;

        GiftQueue.push(
            {
                GiftItemId: args.GiftItemId,
                GiftItemAmount: args.GiftItemAmount
            }
        );

        logMessage = `QueueGiftToUser::GiftQueue: ${JSON.stringify(GiftQueue)}`;
        log.info(logMessage);

        server.UpdateUserData(
            {
                PlayFabId: currentPlayerId,
                Data: { "GiftQueue": GiftQueue }
            });
    }
    catch (e)
    {
        let rawError = `Raw error message: ${e}`
        log.error(rawError)

        let error = e.apiErrorInfo.apiError.error;
        let errorCode = e.apiErrorInfo.apiError.errorCode;
        let errorMessage = `API Error: ${error}. Error code: ${errorCode}`;
        log.error(errorMessage);
    }
}