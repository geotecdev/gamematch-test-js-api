const router = require("express").Router();
const { User, Swipe } = require("../../models");

router.get("/", async (req, res) => {
    // find all users
    try {
      const allUsers = await User.findAll({
        include: [{model: Swipe}],
      });
      res.status(200).json(allUsers);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  router.get("/:id", async (req, res) => {
    // find one user by `id` value
    try {
      const user = await User.findByPk(req.params.id, {
          include: [{model: Swipe}]
      });
      if (!user) {
          res.status(404).json({message: "no users with the specified id exist in the database"});
          return;
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  router.post("/", async (req, res) => {
    // create a new user
    try {
        //console.log(req.body);
        const newUser = await User.create(req.body);
        res.status(200).json(newUser);
    } catch (err) {
        res.status(400).json(err);
    }
  });
  
  router.put("/:id", async (req, res) => {
    // update a user by `id` value
    try {
        const userData = await User.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        if (!userData) {
            res.status(400).json({ message: "Update failed: no user with the specified id was found" });
            return;
        }
        res.status(200).json(userData);
      } catch (err) {
          res.status(500).json(err);
      }
  });
  
  router.delete("/:id", async (req, res) => {
    // delete a user by `id` value
    try {
        const delUser = await User.destroy({
            where: {
                id: req.params.id
            }
          });
          if (!delUser) {
              res.status(400).json({ message: "Delete failed: no user with the specified id was found" });
              return;
          }
          res.status(200).json(delUser);
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;