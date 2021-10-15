"use strict";

// https://www.reddit.com/r/Unity3D/comments/a6rmbh/vr_question_steamvr_2_scale_object_with_both_hands/

class WorldScale {

    WorldScale(_ctl0, _ctl1) {
	    this.ctl0 = _ctl0;
	    this.ctl1 = _ctl1;
	    this.target; // Transform
	    this.armed = false;
	    
	    this.SevenMode = { BOTH: "both", MAIN: "main", ALT: "alt", NONE: "none" };
	    this.sevenMode = this.SevenMode.NONE;
	    
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
            this.sevenMode = this.SevenMode.BOTH;
        } else if (this.ctl0.gripped && !this.ctl1.gripped) {
            this.sevenMode = this.SevenMode.MAIN;
        } else if (!this.ctl0.gripped && this.ctl1.gripped) {
            this.sevenMode = this.SevenMode.ALT;
        } else if (!this.ctl0.gripped && !this.ctl1.gripped) {
            this.sevenMode = this.SevenMode.NONE;
            this.target.SetParent(this.origParent);
            this.armed = false;
            return;
        }

        if (this.armed) {
            switch (this.sevenMode) {
                case SevenMode.BOTH:
                    this.attachTargetBoth();
                    break;
                case SevenMode.MAIN:
                    this.attachTargetOne(this.ctl0);
                    break;
                case SevenMode.ALT:
                    this.attachTargetOne(this.ctl1);
                    break;
            }
            this.armed = false;
        }

        switch (this.sevenMode) {
            case this.SevenMode.BOTH:
                this.updateTargetBoth();
                break;
        }

    }

    attachTargetBoth() {
        this.initialHandPosition1 = this.ctl0.transform.position;
        this.initialHandPosition2 = this.ctl1.transform.position;
        this.initialObjectRotation = this.target.transform.rotation;
        this.initialObjectScale = this.target.transform.localScale;
        this.initialObjectDirection = this.target.transform.position - (this.initialHandPosition1 + this.initialHandPosition2) * 0.5; 
    }

    updateTargetBoth() {
        const currentHandPosition1 = this.ctl0.transform.position; // current first hand position
        const currentHandPosition2 = this.ctl1.transform.position; // current second hand position

        const handDir1 = (this.initialHandPosition1 - this.initialHandPosition2).normalized; // direction vector of initial first and second hand position
        const handDir2 = (currentHandPosition1 - currentHandPosition2).normalized; // direction vector of current first and second hand position 

        const handRot = Quaternion.FromToRotation(handDir1, handDir2); // calculate rotation based on those two direction vectors
        
        const currentGrabDistance = Vector3.Distance(currentHandPosition1, currentHandPosition2);
        const initialGrabDistance = Vector3.Distance(this.initialHandPosition1, this.initialHandPosition2);
        const p = (currentGrabDistance / initialGrabDistance); // percentage based on the distance of the initial positions and the new positions

        const newScale = new Vector3(p * this.initialObjectScale.x, p * this.initialObjectScale.y, p * this.initialObjectScale.z); // calculate new object scale with p

        this.target.transform.rotation = handRot * this.initialObjectRotation; // add rotation
        this.target.transform.localScale = newScale; // set new scale
        
        // set the position of the object to the center of both hands based on the original object direction relative to the new scale and rotation
        this.target.transform.position = (0.5 * (currentHandPosition1 + currentHandPosition2)) + (handRot * (this.initialObjectDirection * p));
    }

    attachTargetOne(_ctl) {
        this.target.SetParent(_ctl.transform);
    }

}

export { WorldScale };