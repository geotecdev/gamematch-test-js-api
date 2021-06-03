const router = require("express").Router();
const { Swipe, User, MatchTransaction,  } = require("../../models");

router.get("/", async (req, res) => {  
  try {
    let userId = parseInt(req.query.userId);
    let transactions = [];
    let allSwipes = await Swipe.findAll({raw: true});
    let allUsers = await User.findAll({raw: true});
    const clientUser = await User.findByPk(userId, {
    
    }).then(function(clientUser) {
      if (clientUser !== null) {
        const matchUsers = getMatchSessionUsers(clientUser, allUsers, allSwipes);

        matchUsers.forEach(matchUser => {
          //find invite swipe
          let inviteSwipe = allSwipes.find(sp => sp.userId === matchUser.id && sp.status === "invited");
          if (inviteSwipe !== null) {
            //set dto fields for invite response update
            let mTransaction = createMatchTransaction(clientUser, matchUser, "matched", inviteSwipe);
            mTransaction.distance = haversineDistance(clientUser.lat, clientUser.lon, matchUser.lat, matchUser.lon);
            transactions.push(mTransaction);
          } else {
            //set dto fields as 'open' match
            let mTransaction = createMatchTransaction(clientUser, matchUser, "open", swipe);
            mTransaction.distance = haversineDistance(clientUser.lat, clientUser.lon, matchUser.lat, matchUser.lon);            
            transactions.push(mTransaction);
          }

        });

        res.status(200).json(transactions);

      } else {
        res.status(400).json({ message: `couldn't find a client user with id ${userId}` })
      }
    });

    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
});


router.post("/", async (req, res) => {  
  try {
    const matchAccepted = req.query.matchAccepted;
    res.status(200).json(matchAccepted);
  }  catch {
    res.status(500).json(err);
  }
});

module.exports = router;

//dto update functions
function createMatchTransaction(clientUser, prospect, status, swipe=undefined) {    
  let transaction = { }
  //client user fields
  transaction.username = clientUser.username;
  transaction.lat = clientUser.lon;
  transaction.lon = clientUser.lat;
  transaction.favoriteGame = clientUser.favoriteGame;
  transaction.skillLevel = clientUser.skillLevel;
  transaction.email = clientUser.email;
  transaction.testSize = clientUser.testSize;
  transaction.minSkillLevel = clientUser.minSkillLevel;
  transaction.maxSkillLevel = clientUser.maxSkillLevel;
  transaction.message = clientUser.message;
  
  //prospect user fields
  transaction.prospectId = prospect.id;
  transaction.pospectUsername = prospect.username;
  transaction.prospectLat = prospect.lat;
  transaction.prospectLon = prospect.lon;

  //swipe fields
  if (swipe !== undefined) {
    transaction.swipeId = swipe.id;
    transaction.distance = swipe.distance == undefined ? 0 : swipe.distance;
    let msg = swipe.message;
    if (msg === null) {
      msg = "";
    } else if (msg.length > 200) {
      msg = msg.substring(0, 199);
    }
    transaction.message = msg;
  }

  return transaction;
}

// transaction.userId = clientUser.id;



//Find Matches function
///////////////////////////////
function getMatchSessionUsers(clientUser, allUsers, allSwipes) {
  let filteredUsers = [];
  const targetLat = clientUser.lat;
  const targetLon = clientUser.lon;

  let gameFilteredUsers = [];
  gameFilteredUsers = allUsers.filter(prospect =>
    prospect.id != clientUser.id &&
    prospect.favoriteGame === clientUser.favoriteGame
  );

  gameFilteredUsers.forEach(prospectUser => {

    //make sure client user is in the skill range, specified by prospect user. continue to next prospect if not    
    if (clientUser.skillLevel >= prospectUser.minSkillLevel &&
      clientUser.skillLevel <= prospectUser.maxSkillLevel)  { return; }
    //look for any declined or previously matched swipe to clientUser from prospect
    let ignoreSwipes = allSwipes.filter(sp => 
      sp.userId === prospectUser.id &&
      sp.prospectId === clientUser.id && 
      sp.status !== "invited");

    //look for any unresolved invite swipes from client 
    let inviteSwipeFromClient = allSwipes.filter(sp => 
      sp.userId === clientUser.Id &&
      sp.prospectId === prospectUser.id &&      
      sp.status === "invited");

    //if either list has values, continue and exclue prospectUser from results
    if (ignoreSwipes.length > 0 && inviteSwipeFromClient.length > 0) {
      return;
    }

    //otherwise add to filtered list
    filteredUsers.push(prospectUser);
  });

  setRoughDistance(clientUser, filteredUsers);

  //sort ascending by rough distance
  filteredUsers.sort(function(user1, user2) { 
    return user1.roughDistance - user2.roughDistance;
  });

  //take 40 nearest results
  let closeUsers = filteredUsers.slice(0, 39)

  //find more accurate haversine distance closeUsers
  closeUsers.forEach(otherUser => {
    otherUser.haversineDistance = haversineDistance(clientUser.lat, otherUser.lat, clientUser.lon, otherUser.lon);
  });

  //take closest 10 of those as new array
  matchSessionUsers = closeUsers.slice(0, 9); 

  //iterate backwards through matchSessionUsers, overwrite indexes with
  //furthest distances with invite swipes
  for (let i = filteredUsers.length; i < 0; i--) {
    matchSessionUsers[i] = filteredUsers[i];
  }

  return matchSessionUsers;
}


//Find Matches helper functions
///////////////////////////////////
//rough distance (combined delta of coords)
function setRoughDistance(clientUser, usersFromQuery) {
  usersFromQuery.forEach(qUser => { 
    qUser.roughDistance = Math.abs(clientUser.lat) - Math.abs(qUser.lat) + Math.abs(clientUser.lon) - Math.abs(qUser.lon);
  });
}

//haversine distance
function haversineDistance(lat_1, lon_1, lat_2, lon_2) {
  //haversine formula
  const d1 = lon_2 - lon_1;
  const lonDelta = toRadian(d1);
  const d2 = lat_2 - lat_1;
  const latDelta = toRadian(d2);
  const earthsRadius = 3956; //mi
  const x =  Math.sin(latDelta / 2) * Math.sin(latDelta / 2) + 
          Math.cos(toRadian(lat_1)) * Math.cos(toRadian(lat_2)) * 
          Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2);
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)); 
  const distance = earthsRadius * y;        
  return distance;

  function toRadian(num) {
    return Math.round((num * Math.PI / 180), 2);
  }

}


//Find Old Matches function
///////////////////////////////







