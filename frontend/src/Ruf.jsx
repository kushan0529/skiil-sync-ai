import { useState,useEffect } from "react";
import Modal from "./components/Modal";
import { X,Search,Trash2,PlusCircle ,CalendarHeart,Users,FileText,Type} from "lucide-react";

const CreateProject=({isOpen,onClose,onSuccess})=>{
    const[formData,setFormData]=useState({
        name:"",
        description:"",
        starDate:"",
        deadline:"",
        task:[],
        requiredskills:[],
        members:[]
    })
    const[users,setUsers]=useState("");
    const[]=useState("");
}