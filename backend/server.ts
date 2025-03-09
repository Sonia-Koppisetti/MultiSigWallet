import express, { Request, Response } from "express";
import cors from "cors";
import { sponsorGasWithPayMaster } from "./biconomyBundler";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); // Enable CORS for frontend communication

app.post("/bundleTransactions", async (req: Request, res: Response) => {
    const { data } = req.body;
    console.log("Received data:", req.body);
    sponsorGasWithPayMaster(req.body.transactions).then((receipt) =>{
        res.json({ message: "Backend method called successfully!", response: receipt });
    })
    // Process the request and send a response
    
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
