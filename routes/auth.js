const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const { User } = require("../db/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.get("/", (req, res) => {
  res.send("auth API呼び出し");
});

//<<ユーザー新規登録用のAPI>>この場合はauth/signupのパスになる
router.post(
  "/signup",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    //1:リクエストから値を取得
    const email = req.body.email;
    const password = req.body.password;
    //console.log(email + password);

    //2:バリデーションチェック（express-validatorを使う）
    //express-validatorのvalidationResultメソッドを使うと引数で渡したbodyメソッドの結果を確認できる
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    //3:DBに同一ユーザーが存在するかを確認※簡易的にはUserオブジェクトの配列を確認する形とする
    const user = User.find(dbuser => dbuser.email === email);
    if (user) {
      return res.status(400).json({
        message: "既にそのユーザーは存在しています"
      });
    }
    //4:パスワードの暗号化(暗号化にはbcrypt使う)
    let hashedPassword = await bcrypt.hash(password, 10);
    //console.log(hashedPassword);

    //5:DBに保存する※簡易的に配列にプッシュする形にしておく
    User.push({
      email: email,
      password: hashedPassword
    });
    //6:Tokenの発行（セッションIDではなくJWT方式で発行する）
    const token = await jwt.sign(
      {
        email
      },
      process.env.SECRETKEY,
      { expiresIn: "24h" }
    );
    return res.json({
      token: token
    });
  }
);
//<<ログイン用API>>
router.post("/signon", async (req, res) => {
  const { email, password } = req.body;
  const user = User.find(dbuser => dbuser.email === email);
  if (!user) {
    return res.status(400).json({
      message: "そのユーザーは存在しません"
    });
  }
  //パスワードの照合
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      message: "パスワードが異なります"
    });
  }
  const token = await jwt.sign(
    {
      email
    },
    process.env.SECRETKEY,
    { expiresIn: "24h" }
  );
  return res.json({
    token: token
  });
});

module.exports = router;
