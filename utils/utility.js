const jwt = require("jsonwebtoken");

exports.sign_jwt_token = (req, res, user) => {
  req.login(user, { session: false }, (err) => {
    if (err) return res.json("An error has occured");
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    jwt.sign(
      payload,
      process.env.SECRET,
      { expiresIn: "2 days" },
      (err, token) => {
        return res.json({
          token,
          id: payload.id,
          username: payload.username,
          isAdmin: payload.isAdmin,
        });
      }
    );
  });
};
