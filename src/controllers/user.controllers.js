import {asyncHandler} from "../utils/asynchandler.js"
//Registering the User
import { ApiError } from "../utils/APIError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/APIResponse.js";
const registerUser=asyncHandler(async(req,res)=>{
        //get User Details from the Frontend
        //Validation - not empty
        //check if user already exists:username or email
        // check for the images,check for avatar
        //upload them to cloudinary,avatar 
        //create  user object-create entry in db
        //remove password ans refresh token field from the response
        //check for user creation 
        //return res
        

        const {fullname,email,username,password}=req.body
        console.log("email:",email);
        if(
            [fullname,email,username,password].some((field)=>field?.trim()==="")
        ){
            throw new ApiError(400,"All fields are compulsory and required")
        }

        const existedUser=await User.findOne({
            $or:[{username},{email}]
        })

        if(existedUser){
            throw new ApiError(400,"User already exists")
        }
        const avatarLocalPath=req.files?.avatar[0]?.path
        const converImageLocalPath=req.files?.coverImage[0]?.path
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar Image is required")
        }


        const avatar=await uploadOnCloudinary(avatarLocalPath)
        const coverImage=await uploadOnCloudinary(converImageLocalPath)

        if(!avatar){
            throw new ApiError(400,"Avatar file is required")
        }

       const user= await User.create({
            fullname,
            avatar:avatar.url,
            coverImage:coverImage.url||"",
            email,
            password,
            username:username.toLoweCase()
        })

        const createdUser=await user.findById(user._id).select(
            "-password -refreshToken"
        )

        if(createdUser){
            throw new ApiError(500,"Something went wrong while Registering the user")
        }
        return res.status(201).json(
            new ApiResponse(200,createdUser,"User Registered Successfully")
        )
})


export {
    registerUser
}