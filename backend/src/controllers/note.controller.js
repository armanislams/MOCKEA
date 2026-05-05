import Note from "../model/note.js";

export const postNote =async(req,res)=>{
const {email,notes}=req.body;
if(!email||!notes){
    res.status(400).json({message:"Please provide email and notes"})
}
const newNote = new Note({
    email,
    notes
})
await newNote.save();
return res.status(200).json({success:true,message:"Note created successfully"});
}

export const getNotesByUser = async(req,res)=>{
    const {email}= req.params;
    if(!email){
        return res.status(400).json({success:false,message:"Please provide email"});
    }
    const data = await Note.find({email:email});
    return res.status(200).json({success:true,message:"Note fetched successfully",notes:data});
}

export const getAllNotes = async(req,res)=>{
    const data = await Note.find();
    return res.status(200).json({success:true,message:"Notes fetched successfully",notes:data});
}