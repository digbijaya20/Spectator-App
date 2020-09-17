require('dotenv').config()
const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//user Model 
const User = require('../models/User')

// @route POST /register
// @des Register a new user
// @access Public
router.post('/',
  [
    check('name', 'Please provide a name').not().isEmpty(),
    check('email', 'Please provide an email').isEmail(),
    check('password', 'Password at least 6 character long').isLength({ min: 6 })

  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() })
    }

    const { name, email, password } = req.body

    try {
      // user already exits ?
      let user = await User.findOne({ email })
      if (user) {
        return res.status(400).json({ error: [{ msg: 'user already exits' }] })
      }
      user = new User({
        name,
        email,
        password
      })

      // password encryption
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)

      await user.save()

      // sign a jsonwebtoken

      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 36000
      },
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      )
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
    }
  })

module.exports = router


// json file package.json
/*
{
  "name": "server",
  "version": "1.0.0",
  "description": "\"MERN application by Muhammad Idrees\"",
  "main": "server.js",
  "engines": {
    "node": "11.6.0"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js",
    "server": "nodemon server.js",
    "client": "npm start --prefix client",
    "clientinstall": "npm install --prefix client",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install --prefix client && npm run build --prefix client"
  },
  "author": "Muhammad Idrees",
  "license": "ISC",
  "dependencies": {
    "bcrypt": "^3.0.6",
    "concurrently": "^4.1.2",
    "config": "^3.2.2",
    "cors": "^2.8.5",
    "dotenv": "^8.1.0",
    "express": "^4.17.1",
    "express-validator": "^6.2.0",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^5.6.11"
  },
  "devDependencies": {
    "nodemon": "^1.19.1"
  }
}
*/