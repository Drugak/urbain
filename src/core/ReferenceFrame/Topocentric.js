import ReferenceFrameBodyFixed from "./BodyFixed";
import {Quaternion, Vector} from "../../algebra";
import {RF_BASE} from "./Factory";
import StateVector from "../StateVector";

export default class ReferenceFrameTopocentric extends ReferenceFrameBodyFixed
{
    constructor(origin, lat, lon, height, isInertial) {
        super(origin, isInertial);
        this.bodyFixedQuaternion = new Quaternion().setFromEuler(0, -lat, lon, 'ZYX');
        this.bodyFixedPosition = (new Vector([this.body.physicalModel.radius + height, 0, 0])).rotateY(-lat).rotateZ(lon);
    }

    getQuaternionByEpoch(epoch) {
        return this.body.orientation.getQuaternionByEpoch(epoch).mul(this.bodyFixedQuaternion)
    }

    getRotationVelocityByEpoch(epoch) {
        return Quaternion.invert(this.bodyFixedQuaternion).rotate(
            new Vector([0, 0, this.body.orientation.angularVel])
        );
    }

    getOriginStateByEpoch(epoch) {
        const bodyState = sim.starSystem.getTrajectory(this.origin).getStateByEpoch(epoch, RF_BASE);
        const bodyQuaternion = this.body.orientation.getQuaternionByEpoch(epoch);

        let rfVel = this.bodyFixedPosition.cross(
            new Vector([0, 0, this.body.orientation.angularVel])
        );

        const destPos = bodyQuaternion.rotate(this.bodyFixedPosition).add_(bodyState.position);
        const destVel = bodyQuaternion.rotate_(rfVel.mul_(-1)).add_(bodyState.velocity);

        return new StateVector(
            destPos,
            destVel
        );
    }
}