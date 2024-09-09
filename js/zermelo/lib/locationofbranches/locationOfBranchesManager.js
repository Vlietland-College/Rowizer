import { ManagerWithId } from "../manager.js";
import LocationOfBranchEntity from "./locationOfBranchEntity.js";

class LocationOfBranchesManager extends ManagerWithId{
    endpoint = "locationofbranches";
    interface = LocationOfBranchEntity;


}

export default LocationOfBranchesManager
