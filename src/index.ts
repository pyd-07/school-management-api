import express from "express"
import dotenv from "dotenv"
import SchoolRoutes from "./routes/schools.js"

dotenv.config()
const app = express()

app.set("trust proxy", 1);
app.use(express.json())
app.use("/", SchoolRoutes)

app.get("/", (req, res)=> {
    res.status(200).json({status: "school-management-api is running"})
})

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=> {
    console.log("App is running on PORT:", PORT)
})