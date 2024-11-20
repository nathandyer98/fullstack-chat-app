import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
       if (!fullName || !email || !password) { 
           return res.status(400).json({ message: 'Please fill in all fields' });
        }

        if (password.length < 6) {
           return res.status(400).json({ message: 'Password must be at least 6 characters' });
       }

       const user = await User.findOne({ email });

       if (user) {
           return res.status(400).json({ message: 'User already exists' });
       }

       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(password, salt);

       const newUser = new User({
           fullName,
           email,
           password : hashedPassword
       });

       if(newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id : newUser._id,
                fullName : newUser.fullName,
                email : newUser.email,
                avatar : newUser.avatar
            })
       }
       
    } catch (error) {
        console.log("Error in signup controller: " + error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const login = async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id : user._id,
            fullName : user.fullName,
            email : user.email,
            avatar : user.avatar
        });

    } catch (error) {
        console.log("Error in login controller: " + error);
        res.status(500).json({ message: 'Internal server error' });
        
    }
};


export const logout = (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 });
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.log("Error in logout controller: " + error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;
        const userId = req.user._id;

        if(!avatar) {
            return res.status(400).json({ message: 'Please upload an avatar' });
        }

        const uploadResponse = await cloudinary.uploader.upload(avatar);

        const updatedUser = await User.findByIdAndUpdate(userId, { avatar: uploadResponse.secure_url }, { new: true });

        res.status(200).json(updatedUser);

    } catch (error) {
       console.log("Error in updateProfile controller: " + error);
       res.status(500).json({ message: 'Internal server error' }); 
    }

}

export const checkAuth = async(req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller: " + error);
        res.status(500).json({ message: 'Internal server error' });
    }
}