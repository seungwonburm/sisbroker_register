const express  = require("express");
const router   = express.Router();

const http     = require('http')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const uuid4    = require('uuid4')
const oDbCon   = require('oracledb');

const logger           = require("../config/winston");
const conmaria         = require("./db_config.js");
const { PrismaClient } = require('@prisma/client')
const prisma           = new PrismaClient()

router.post('/signup', async (req , res) => {
    try{
        console.log (req.body)
        const {email, password, institution, department, position, name } =  req.body
        
        if ( !email || !password || !institution || !department || !position || !name) {
            const error = new Error('INVALID INPUT')
            error.statusCode = 400
            throw error
        }

        const emailExists = await prisma.clients.findUnique({ where: {email} })

        if (emailExists){
            const error = new Error('EMAIL ALREADY EXISTS')
            error.statusCode = 400
            throw error
        }   
        
        if (!validEduEmail(email)){
            const error = new Error ('INVALID .edu EMAIL')
            error.statusCode = 400
            throw error
        } 
       
        if (!validPassword(password)){
            const error = new Error('INVALID PASSWORD')
            error.statusCode = 400
            throw error 
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const institutionExists = await prisma.clients.findFirst({
            where: { institution: { endsWith: institution }},
        })
        
        if (institutionExists === null) institutionKey = uuid4()
        else institutionKey = institutionExists.institutionKey
    
     
        const createdUser = await prisma.clients.create({
            data: {
                email,
                password: hashedPassword,
                institution,
                department,
                position,
                name,
                institutionKey
            }
        })
        console.log('ACCOUNT CREATION SUCCESSFUL')

        res.status(201).json({ message : 'SUCCESS', createdUsersEmail: createdUser.email, institutionKey : institutionKey})
    } catch(err){
        console.log(err)
        statusCode = err.statusCode || 500
        res.status(statusCode).json({message: err.message})
    }
})

router.post('/login', async(req, res) => {
    try{
        const { email, password: inputPassword } = req.body

        const foundUser = await prisma.clients.findUnique({ where: {email}})

        if (!foundUser){
            const error = new Error('not found')
            error.statusCode = 404
            throw error
        }

        const { password: hashedPassword} = foundUser
        
        const isValidPassword = await bcrypt.compare(inputPassword, hashedPassword)
       
        if (!isValidPassword){
            const error = new Error('INVALID PASSWORD')
            error.statusCode = 400
            throw error
        }

        const token = jwt.sign({ clientKeyID: foundUser.id, email }, process.env.JWT_SECRET_KEY)

        const endpointExists = await prisma.configs.findFirst({ where: {client_key : foundUser.id}})
    
        if (endpointExists) loginstatus = 'RETURNING USER' 
        else loginstatus = 'NEW USER'
        
        res.status(200).json({ email, token,  message : loginstatus})
    } catch (err) {
        console.log(err)
        statusCode = err.statusCode || 500
        res.status(statusCode).json({message: err.message})
    }
})

router.post('/dbconnect', async(req, res) => {
    try{
        const { email, dbIP, dbType, dbPort, dbID, dbPW } = req.body

        ORACLE_CONNECT = {
                user : dbID,
                password : dbPW,
                connectString :`(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${dbIP})(PORT=${dbPort}))(CONNECT_DATA=(SERVICE_NAME=${dbType})))`
        }

        await oDbCon.getConnection(ORACLE_CONNECT).catch(err => {
                const error = new Error(err.message)
                error.statusCode = 400
                throw error
            }
        )

        await prisma.clients.updateMany({
            where: {
            email: {
                contains: email
            },
            },
            data: {
            dbIP, dbType, dbPort, dbID, dbPW
            },
        }
        )
        res.status(200).json({ message : "DB CONNECTION SUCCESSFUL"})
    } catch (err) {
        console.log(err)
        statusCode = err.statusCode || 500
        res.status(statusCode).json({message: err.message})
    }
})




const validEduEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.+-]+\.edu$/
    return re.test(String(email).toLowerCase())
}

const validPassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return re.test(password)
}

module.exports = router;