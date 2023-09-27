import React, { useEffect, useRef, useState } from "react";
import styles from "./priceform.module.scss";
import "react-datepicker/dist/react-datepicker.css";
import he from "date-fns/locale/he";
import { registerLocale } from "react-datepicker";
registerLocale("he", he);
import Way from "./Way";

const TwoWays = (props) => {
  // formatDuration showDistance
  // console.log("TwoWays.jsx render");
  return (
    <div className={styles.twoWays}>
      <Way
        outboundAutocompleteRef={props.outboundAutocompleteRef}
        outboundEndPointAutocompleteRef={props?.outboundEndPointAutocompleteRef}
        outboundTotalDistance={props?.outboundTotalDistance}
        outboundTotalDuration={props?.outboundTotalDuration}
        outboundStopsAutocompleteRefs={props?.outboundStopsAutocompleteRefs}
        inboundTotalDistance={props?.inboundTotalDistance}
        inboundTotalDuration={props?.inboundTotalDuration}
        showDistance={props?.showDistance}
        formatDuration={props?.formatDuration}
        today={props?.today}
        CustomDateInput={props?.CustomDateInput}
        handleDateChange={props?.handleDateChange}
        handleFields={props?.handleFields}
        handlePointSelect={props?.handlePointSelect}
        route={props?.route}
        routeInfo={props?.routeInfo}
        addNewStop={props?.addNewStop}
        removeStop={props?.removeStop}
        wayType={"outbound"}
        calculateRouteInformation={props?.calculateRouteInformation}
        calculateMinTime={props?.calculateMinTime}
        isToday={props?.isToday}
        wayTitle={"דרך הלוך"}
      />
      <Way
        inboundAutocompleteRef={props?.inboundAutocompleteRef}
        inboundEndPointAutocompleteRef={props?.inboundEndPointAutocompleteRef}
        inboundTotalDistance={props?.inboundTotalDistance}
        inboundTotalDuration={props?.inboundTotalDuration}
        inboundStopsAutocompleteRefs={props?.inboundStopsAutocompleteRefs}
        outboundTotalDistance={props?.outboundTotalDistance}
        outboundTotalDuration={props?.outboundTotalDuration}
        showDistance={props?.showDistance}
        formatDuration={props?.formatDuration}
        today={props?.today}
        CustomDateInput={props?.CustomDateInput}
        handleDateChange={props?.handleDateChange}
        handleFields={props?.handleFields}
        handlePointSelect={props?.handlePointSelect}
        route={props?.route}
        routeInfo={props?.routeInfo}
        addNewStop={props?.addNewStop}
        removeStop={props?.removeStop}
        wayType={"inbound"}
        calculateRouteInformation={props?.calculateRouteInformation}
        calculateMinTime={props?.calculateMinTime}
        isToday={props?.isToday}
        minTimeInbound={props?.inboundMinTime}
        wayTitle={"דרך חזור"}
      />
    </div>
  );
};

export default TwoWays;
