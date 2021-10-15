"use strict";

// https://www.reddit.com/r/Unity3D/comments/a6rmbh/vr_question_steamvr_2_scale_object_with_both_hands/

class WorldScale {

    WorldScale() {
	    this.ctl0;
	    this.ctl1;
	    this.target; // Transform

	    this.armed = false;
	    this.SevenMode { BOTH, MAIN, ALT, NONE };
	    this.sevenMode = SevenMode.NONE;
	    this.initialHandPosition1; // first controller
	    this.initialHandPosition2; // second controller
	    this.initialObjectRotation; // this.target rotation, Quaternion
	    this.initialObjectScale; // this.target scale
	    this.initialObjectDirection; // direction of this.target to midpoint of both controllers
	    this.origParent = this.target.parent;
    }

    Update() {
        if (this.ctl0.gripDown || this.ctl1.gripDown) {
            this.target.SetParent(origParent);
            this.armed = true;
        }

        if (this.ctl0.gripped && this.ctl1.gripped) {
            sevenMode = SevenMode.BOTH;
        } else if (this.ctl0.gripped && !this.ctl1.gripped) {
            sevenMode = SevenMode.MAIN;
        } else if (!this.ctl0.gripped && this.ctl1.gripped) {
            sevenMode = SevenMode.ALT;
        } else if (!this.ctl0.gripped && !this.ctl1.gripped) {
            sevenMode = SevenMode.NONE;
            this.target.SetParent(origParent);
            this.armed = false;
            return;
        }

        if (this.armed) {
            switch (sevenMode) {
                case SevenMode.BOTH:
                    attachTargetBoth();
                    break;
                case SevenMode.MAIN:
                    attachTargetOne(ref this.ctl0);
                    break;
                case SevenMode.ALT:
                    attachTargetOne(ref this.ctl1);
                    break;
            }
            this.armed = false;
        }

        switch (sevenMode) {
            case SevenMode.BOTH:
                updateTargetBoth();
                break;
        }

    }

    attachTargetBoth() {
        this.initialHandPosition1 = this.ctl0.transform.position;
        this.initialHandPosition2 = this.ctl1.transform.position;
        this.initialObjectRotation = this.target.transform.rotation;
        this.initialObjectScale = this.target.transform.localScale;
        this.initialObjectDirection = this.target.transform.position - (initialHandPosition1 + initialHandPosition2) * 0.5; 
    }

    updateTargetBoth() {
        const currentHandPosition1 = this.ctl0.transform.position; // current first hand position
        const currentHandPosition2 = this.ctl1.transform.position; // current second hand position

        const handDir1 = (initialHandPosition1 - initialHandPosition2).normalized; // direction vector of initial first and second hand position
        const handDir2 = (currentHandPosition1 - currentHandPosition2).normalized; // direction vector of current first and second hand position 

        const handRot = Quaternion.FromToRotation(handDir1, handDir2); // calculate rotation based on those two direction vectors
        
        const currentGrabDistance = Vector3.Distance(currentHandPosition1, currentHandPosition2);
        const initialGrabDistance = Vector3.Distance(initialHandPosition1, initialHandPosition2);
        const p = (currentGrabDistance / initialGrabDistance); // percentage based on the distance of the initial positions and the new positions

        const newScale = new Vector3(p * initialObjectScale.x, p * initialObjectScale.y, p * initialObjectScale.z); // calculate new object scale with p

        this.target.transform.rotation = handRot * initialObjectRotation; // add rotation
        this.target.transform.localScale = newScale; // set new scale
        
        // set the position of the object to the center of both hands based on the original object direction relative to the new scale and rotation
        this.target.transform.position = (0.5 * (currentHandPosition1 + currentHandPosition2)) + (handRot * (initialObjectDirection * p));
    }

    attachTargetOne(ref SteamVR_NewController ctl) {
        this.target.SetParent(ctl.transform);
    }

}

export { WorldScale };