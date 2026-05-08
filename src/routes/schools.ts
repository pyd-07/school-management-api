import { Router } from "express"
import pool from "../config/db.js"
import getDistance from "../utils/getDistance.js"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

const router = Router()

interface School extends RowDataPacket{
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
}
interface SchoolWithDistance extends School {
    distance: number
}

router.post("/addSchool", async (req, res) => {
    const {name, address, latitude, longitude} = req.body

    if (!name || typeof name !== "string" || name.trim()==="") {
        res.status(400).json({ error: "name is required and must be non-empty string"})
        return
    }
    if (!address || typeof address !== "string" || address.trim()==="") {
        res.status(400).json({ error: "address is required and must be a non-empty string"})
        return
    }
    if (!latitude || latitude === null || isNaN(Number(latitude)) ) {
        res.status(400).json({ error: "latitude is required and must be a number"})
        return
    }
    if (!longitude || longitude === null || isNaN(Number(longitude))){
        res.status(400).json({ error: "longitude is required and must be a number"})
        return
    }

    const lat = Number(latitude)
    const lon = Number(longitude)
    
    // valid latitude and longitude values check [reference: google]
    if (lat > 90 || lat < -90 ){
        res.status(400).json({ error: "latitude must be between -90 and 90"})
        return
    }
    if (lon >180 || lon < -180){
        res.status(400).json({ error: "longitude must be between -180 and 180"})
        return
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            `
                INSERT INTO schools (name, address,latitude, longitude)
                VALUES ($1, $2, $3, $4)
            `, [name.trim(), address.trim(), lat, lon]
        )
        
        res.status(201).json({ 
            message: "School added successfully",
            SchoolID: result.insertId
        })
        
    }catch(error){
        console.error("Error adding school:", error)
        res.status(500).json({error:"Internal server error"})
    }
})

// implement GET end-point