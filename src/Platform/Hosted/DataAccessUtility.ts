import Q from "q";
import { DataAccessUtilityBase } from "../../Common/DataAccessUtilityBase";

export class DataAccessUtility extends DataAccessUtilityBase {
  public refreshCachedOffers(): Q.Promise<void> {
    return Q();
  }

  public refreshCachedResources(): Q.Promise<void> {
    return Q();
  }
}
