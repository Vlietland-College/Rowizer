import { Manager } from "../manager.js";
import Branch from "./branchInterface.js";

class BranchesManager extends Manager{
    endpoint = "branches";
    interface = Branch;
}

export default BranchesManager
