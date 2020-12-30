const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {UserInputError} = require("apollo-server")

const User = require("../../models/User")
const {SECRET_KEY} = require("../../config")
const {
    validateRegisterInput,
    validateLoginInput
  } = require('../../util/validators');

const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, 
    SECRET_KEY,
    { expiresIn: "1h"})
}

module.exports = {
    Mutation: {
            async login(parent, {username, password}){

                // validate input
                const {errors, valid} = validateLoginInput(username, password)

                // throw error if input is invalid
                if(!valid){
                    throw new UserInputError("Errors", {errors})
                }

                // check if user is already created
                const user = await User.findOne({username})

                // throw error if no user
                if(!user){
                    errors.general = "User not found."
                    throw new UserInputError("User not found", {errors})
                }

                // check password is correct
                const match = await bcrypt.compare(password, user.password);

                // throw error if password doesnt match
                if(!match){
                    errors.general = "Wrong credentials."
                    throw new UserInputError("Wrong credentials", {errors})
                }

                // get json web token
                const token = generateToken(user)

                // return user info and token
                return {
                    ...user._doc,
                    id: user._id,
                    token
                }
            },
            async register(
                parent, 
                {registerInput:{username, email, password, confirmPassword}}){

                    // validate input
                    const {valid,errors} = validateRegisterInput(username, email, password, confirmPassword)

                    // throw error if wrong input
                    if(!valid){
                        throw new UserInputError('Errors', {errors})
                    }

                    // check if user is already created
                    const user = await User.findOne({username})

                    // throw error if user is found
                    if(user){
                        throw new UserInputError("Username is taken", {
                            errors: {
                                username: "This username is taken."
                            }
                        })
                    }

                    // hash password
                    password = await bcrypt.hash(password, 12)

                    // create new user
                    const newUser = new User({
                        email,
                        password,
                        username,
                        createdAt: new Date().toISOString()
                    })

                    //save new user
                    const res = await newUser.save();

                    // create json web token
                    const token = generateToken(res)

                    // return user info and token
                    return {
                        ...res._doc,
                        id: res._id,
                        token
                    }
            }
    }
}