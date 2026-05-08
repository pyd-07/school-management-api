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
                VALUES (?, ?, ?, ?)
            `, [name.trim(), address.trim(), lat, lon]
        )
        
        res.status(201).json({ 
            message: "School added successfully",
            SchoolID: result.insertId
        })
        
    }catch(error){
        console.error("Error adding school:", (error as Error).message)
        res.status(500).json({error:"Internal server error"})
    }
})

router.get("/listSchools", async (req, res) => {
    const {latitude, longitude} = req.query

    if(!longitude || isNaN(Number(longitude))) {
        res.status(400).json({ error: "latitude query param is required and must be a number"})
        return
    }
    if(!latitude || isNaN(Number(latitude))) {
        res.status(400).json({ error: "longitude query param is required and must be a number"})
        return
    }

    const userLat = Number(latitude)
    const userLon = Number(longitude)

    try {
        const [schools] = await pool.query<[School]>(`SELECT * FROM schools`)

        const sorted = schools.map((school) => ({
            ...school,
            distance: getDistance(userLat,userLon, school.latitude, school.longitude)
        })).sort((a,b)=>(a.distance - b.distance))

        res.status(200).json({schools: sorted})

    } catch (err) {
        console.error("Error fetching schools:", (err as Error).message)
        return res.status(500).json({error: "Internal Server Error"})
    }
})

export default router