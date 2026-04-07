import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
const token=localStorage

const checkAuth=createAsyncThunk('auth/checkAuth',async(_,{reject}))

const authSlice=createSlice({
    name:auth,
    initialState:{
        user:null,
        token:token,
        isAuthenticated:!!token,
        loading:true,
        error:false
    },
    reducers:{
        logintrue:(state,action)=>{
            const{token,user}=action.payload;
            state.user=user;
            state.token=token;
            state.loading=false;
            localStorage.setItem('token',token);
            axios.defaults.headers.common['Authorization']=`Bearer${token}`;
        },
        logout:(state)=>{
            state.user=null;
            state.token=null;
            state.isAuthenticated=false;
            localStorage.removeItem("token");
            delete axios.defaults.headers.common['Authorization']
        },
        setLoading:(state,action)=>{
            state.loading=action.payload;

        }
    },
    extraReducers:(builder)=>{
        builder.addCase(checkAuth.pending,(state)=>{
            state.loading=true;
        })
        .addCase(checkAuth,)

    }

})