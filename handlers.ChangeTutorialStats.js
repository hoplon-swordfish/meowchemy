handlers.ChangeTutorialStats = (args, context) => {
  if (typeof args !== "number") {
    return false;
  }

  server.UpdateUserData({
    PlayFabId: currentPlayerId,
    Data: { TutorialState: args },
  });
};
