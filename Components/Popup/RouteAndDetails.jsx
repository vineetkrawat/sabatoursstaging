import React, { useEffect, useState, useMemo, useCallback } from "react";
import Popup from "./Popup";
import styles from "./routeanddetails.module.scss";
import { GoogleMap } from "@react-google-maps/api";
import { DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import axios from "axios";
import generatePDF from "../../utils/generatePDF";
import { AiFillCloseCircle } from "react-icons/ai";
import { useRouter } from "next/navigation";
import LogoAnim from "../../public/media/LogoAnimationLottie.json";
import Lottie from "lottie-react";

const mapStyles = {
  height: "200px",
  width: "400px",
};

const RouteAndDetails = (props) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [inputVerificationCode, setInputVerificationCode] = useState("");
  const [actualVerificationCode, setActualVerificationCode] = useState(null);

  const [outboundDirections, setOutboundDirections] = useState(null);
  const [inboundDirections, setinboundDirections] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const [userDetails, setUserDetails] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    verified: false,
  });

  const router = useRouter();

  // if (!window.google || !window.google.maps) {
  //   return null; // Return something or display an error message
  // }

  const outBoundStartPointCoors = useMemo(
    () => ({
      lat: parseFloat(props?.route?.outbound?.startPoint?.lat),
      lng: parseFloat(props?.route?.outbound?.startPoint?.lng),
    }),
    [props.route]
  );
  const inBoundStartPointCoors = useMemo(
    () => ({
      lat: parseFloat(props?.route?.inbound?.startPoint?.lat),
      lng: parseFloat(props?.route?.inbound?.startPoint?.lng),
    }),
    [props.route]
  );

  const outBoundStopWaypoints = useMemo(
    () =>
      props?.route?.outbound?.stops?.map((stop) => ({
        location: new window.google.maps.LatLng(
          parseFloat(stop.lat),
          parseFloat(stop.lng)
        ),
      })),
    [props?.route?.outbound?.stops]
  );
  const inBoundStopWaypoints = useMemo(
    () =>
      props?.route?.inbound?.stops?.map((stop) => ({
        location: new window.google.maps.LatLng(
          parseFloat(stop.lat),
          parseFloat(stop.lng)
        ),
      })),
    [props?.route?.inbound?.stops]
  );

  const outBoundEndPointCoors = useMemo(
    () => ({
      location: new window.google.maps.LatLng(
        parseFloat(props?.route?.outbound?.endPoint?.lat),
        parseFloat(props?.route?.outbound?.endPoint?.lng)
      ),
    }),
    [props.route]
  );
  const inBoundEndPointCoors = useMemo(
    () => ({
      location: new window.google.maps.LatLng(
        parseFloat(props?.route?.inbound?.endPoint?.lat),
        parseFloat(props?.route?.inbound?.endPoint?.lng)
      ),
    }),
    [props.route]
  );

  const onLoadOutboundDirections = useCallback((directionsResult) => {
    setOutboundDirections(directionsResult);
    setLoaded(true);
  }, []);
  const onLoadinboundDirections = useCallback((directionsResult) => {
    setinboundDirections(directionsResult);
    setLoaded(true);
  }, []);

  useEffect(() => {
    setLoaded(true);
    setLoaded(false);
  }, [props?.route]);

  // const [verificationType, setVerificationType] = useState(null);
  const [userVerification, setUserVerification] = useState({
    selecting: false,
    sms: {
      selectedMethod: false,
      verified: false,
      isVerifying: false,
    },
    whatsapp: {
      selectedMethod: false,
      verified: false,
      isVerifying: false,
    },
    email: {
      selectedMethod: false,
      verified: false,
      isVerifying: false,
    },
  });

  const selectingMethod = () => {
    const jsx = (
      <div className={styles.methodSelectionPopup}>
        <h3>נא לבחור אחת מהאופציות הבאות לאימות</h3>
        <div className={styles.options}>
          <div
            className={styles.option}
            onClick={() => verificationMethod("SMS")}
          >
            <h4>אימות עם סמס</h4>
            <p>sms image</p>
          </div>
          <div
            className={styles.option}
            onClick={() => verificationMethod("WHATSAPP")}
          >
            <h4>אימות עם וואטסאפ</h4>
            <p>whatsapp image</p>
          </div>
          <div
            className={styles.option}
            onClick={() => verificationMethod("EMAIL")}
          >
            <h4>אימות עם אימייל</h4>
            <p>email image</p>
          </div>
        </div>
      </div>
    );
    return jsx;
  };

  useEffect(() => {
    if (userVerification.selecting == true) {
      props?.handlePopup(true, selectingMethod());
    }
  }, [userVerification]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const newDetails = {};
    const inputsArray = Array.from(e.target);

    inputsArray.forEach((input) => {
      if (input.type !== "submit") {
        newDetails[input.name] = input.value;
      }
    });

    setUserDetails((prevDetails) => ({ ...prevDetails, ...newDetails }));
    props?.sendDataToApp(newDetails);

    setUserVerification({ ...userVerification, selecting: true });
  };

  const verificationScreen = (method, code) => {
    const jsx = (
      <div className={styles.verificationPopup}>
        <p>
          הזן את קוד האימות שנשלח אליך ב
          {method === "EMAIL" ? "אימייל" : method === "SMS" ? "סמס" : "וואטסאפ"}
        </p>
        <form
          className={styles.inpAndBtn}
          onSubmit={(e) =>
            handleVerify(e.target[0].value, code, userDetails, props, e)
          }
        >
          <input
            type="number"
            pattern="[0-9]*"
            inputMode="numeric"
            // value={inputVerificationCode}
            onChange={(e) => setInputVerificationCode(e.target.value)}
          />
          <button>אמת</button>
        </form>
      </div>
    );
    return jsx;
  };

  const verificationMethod = async (method) => {
    let response;
    let data;
    switch (method) {
      case "SMS":
        break;
      case "WHATSAPP":
        break;
      case "EMAIL":
        response = await fetch("/api/sendVerification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userDetails.email,
            firstname: userDetails.firstname,
          }),
        });
        break;
    }
    data = await response.json();
    if (await data.success) {
      setActualVerificationCode(data.code);
      props?.handlePopup(true, verificationScreen(method, data.code), {
        boxShadow: "none",
        background: "none",
        maxWidth: "fit-content",
        padding: "0",
      });
      setIsVerifying(true);
    } else {
    }
  };

  const cst = {
    width: "200px",
    height: "200px",
  };

  const handleVerify = async (
    inputVerificationCode,
    actualVerificationCode,
    userDetails,
    props,
    e
  ) => {
    e.preventDefault();
    console.log("e");
    console.log(e);
    if (verifyCode(inputVerificationCode, actualVerificationCode)) {
      userDetails = setUserVerificationDetails(userDetails, true);
      props.handlePopup(false, <Popup show={false} />);
      props.handlePopup(
        true,
        <>
          <Lottie animationData={LogoAnim} />
          <h3>טוען..</h3>
        </>,
        {
          boxShadow: "none",
          background: "none",
          maxWidth: "fit-content",
          padding: "0",
          textAlign: "center",
        }
      );

      let offerId = await createPriceOffer();

      // Assuming sendDataToApp is a synchronous operation
      sendDataToApp(props, userDetails, offerId);

      // Capture the result of handlePDFGeneration
      const pdfBlob = await handlePDFGeneration(userDetails, props, offerId);

      // Pass the pdfBlob to uploadPdfAndUpdateOffer
      await uploadPdfAndUpdateOffer(pdfBlob, offerId, userDetails, props);

      // Send the email with the price offer to the user
      await sendPriceOfferEmail(
        userDetails,
        props?.userRoute,
        props?.carType,
        props?.price,
        offerId,
        pdfBlob
      );
      props.handlePopup(
        false,
        <>
          <Lottie animationData={LogoAnim} />
          <h3>טוען..</h3>
        </>,
        {
          boxShadow: "none",
          background: "none",
          maxWidth: "fit-content",
          padding: "0",
          textAlign: "center",
        }
      );

      setIsVerifying(false);

      router.push("/checkout");
    } else {
      alert("קוד האימות שגוי, אנא נסה שנית.");
    }
  };

  // Verify the code
  const verifyCode = (inputCode, actualCode) => {
    console.log("inputCode");
    console.log(inputCode);
    console.log("actualCode");
    console.log(actualCode);
    return inputCode === actualCode;
  };

  // Set user verification details
  const setUserVerificationDetails = (userDetails, verified) => {
    return { ...userDetails, verified };
  };

  // Create a new price offer
  const createPriceOffer = async () => {
    try {
      const wpRes = await axios.post(`/api/priceOffers`, {
        title: {
          raw: "הצעת מחיר חדשה",
          rendered: "הצעת מחיר חדשה",
        },
        status: "pending",
      });
      return wpRes.data.id;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Send data to the main application
  const sendDataToApp = (props, userDetails, offerId) => {
    props.sendDataToApp(
      props.route,
      { price: props.price },
      { carType: props.carType },
      { offerId: offerId },
      userDetails
    );
  };

  const handlePDFGeneration = (userDetails, props, offerId) => {
    return new Promise((resolve, reject) => {
      generatePDF(
        userDetails,
        props.route,
        props.price,
        props.carType,
        offerId,
        (pdfBlob) => {
          if (pdfBlob) {
            // Trigger the PDF download for the client
            const blobURL = window.URL.createObjectURL(pdfBlob);
            const tempLink = document.createElement("a");
            tempLink.href = blobURL;
            tempLink.setAttribute(
              "download",
              `הצעת מחיר סבן טורס-${offerId}.pdf`
            );
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobURL);
            resolve(pdfBlob); // Resolve the promise with the pdfBlob
          } else {
            reject(new Error("Failed to generate PDF blob")); // Reject the promise if no blob is returned
          }
        }
      );
    });
  };

  // Upload PDF and update the offer
  const uploadPdfAndUpdateOffer = async (
    pdfBlob,
    offerId,
    userDetails,
    props
  ) => {
    try {
      // Convert Blob to File
      const file = new File([pdfBlob], `price_offer_${offerId}.pdf`, {
        type: "application/pdf",
      });

      console.log("file");
      console.log(file);

      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append("file", file);

      // Upload PDF to WordPress Media Library
      const mediaRes = await axios.post(`/api/uploadPdf/${offerId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("await mediaRes.data");
      console.log(await mediaRes.data);
      const mediaID = mediaRes.data.id;

      // Update the offer post with the media ID and other details
      const updateRes = await axios.put(`/api/priceOffers`, {
        offerId: offerId,
        title: {
          raw: `הצעת מחיר מספר ${offerId}`,
          rendered: `הצעת מחיר מספר ${offerId}`,
        },
        status: "publish",
        acf: {
          PO_id: parseInt(offerId),
          PO_car_type: props?.carType,
          PO_client_email: userDetails.email,
          PO_client_name: userDetails.firstname + " " + userDetails.lastname,
          PO_client_phone: userDetails.phone,
          PO_date: props?.route?.currentDate,
          PO_expiry_date: props?.route?.expDate,
          PO_passengers_count: props?.route?.passengers,
          PO_price: props?.price?.toString(),
          PO_route_event: props?.route?.eventType,
          PO_route_type: props?.route?.routeType,
          PO_outbound: {
            distance: props?.route?.outbound?.distance?.toString(),
            duration: props?.route?.outbound?.duration?.toString(),
            endpoint_address: props?.route?.outbound?.endPoint?.address,
            startpoint_address: props?.route?.outbound?.startPoint?.address,
            startpoint_date: props?.route?.outbound?.startPoint?.date,
            startpoint_time: props?.route?.outbound?.startPoint?.time,
          },
          PO_inbound: {
            distance: props?.route?.inbound?.distance
              ? props?.route?.inbound?.distance?.toString()
              : null,
            duration: props?.route?.inbound?.duration
              ? props?.route?.inbound?.duration?.toString()
              : null,
            endpoint_address: props?.route?.inbound?.endPoint?.address
              ? props?.route?.inbound?.endPoint?.address
              : null,
            startpoint_address: props?.route?.inbound?.startPoint?.address
              ? props?.route?.inbound?.startPoint?.address
              : null,
            startpoint_date: props?.route?.inbound?.startPoint?.date
              ? props?.route?.inbound?.startPoint?.date
              : null,
            startpoint_time: props?.route?.inbound?.startPoint?.time
              ? props?.route?.inbound?.startPoint?.time
              : null,
          },
          PO_file: mediaID, // Use the media ID from the first step
        },
      });

      // Handle the response from the offer update
      if (updateRes.status === 200) {
        console.log("Offer updated successfully");
        // Trigger the PDF download for the client
        const blobURL = URL.createObjectURL(pdfBlob);
        const tempLink = document.createElement("a");
        tempLink.href = blobURL;
        tempLink.setAttribute("download", `price_offer_${offerId}.pdf`);
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        URL.revokeObjectURL(blobURL);
      } else {
        console.error("Failed to update the offer");
      }
    } catch (error) {
      console.error(
        "An error occurred while uploading PDF and updating offer:",
        error
      );
      throw error; // Re-throw the error if you want to handle it further up the call stack
    }
  };

  // This function sends the price offer email with the attached PDF.
  const sendPriceOfferEmail = async (
    userDetails,
    routeDetails,
    carType,
    price,
    offerId,
    pdfBlob
  ) => {
    try {
      // Ensure that pdfBlob is a Blob.
      console.log("pdfBlob");
      console.log(pdfBlob);
      console.log(typeof pdfBlob);
      if (!(pdfBlob instanceof Blob)) {
        throw new TypeError("The pdfBlob parameter is not a Blob.");
      }

      // Convert the PDF blob to a base64 string
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.readAsDataURL(pdfBlob);

        reader.onloadend = async () => {
          const base64data = reader.result;

          try {
            // API call to send the price suggestion email with the PDF attached
            const response = await axios.post(`/api/sendPriceSuggestion`, {
              userDetails: userDetails,
              pdfBase64: base64data,
              route: routeDetails,
              price: price,
              carType: carType,
              offerId: offerId,
            });

            resolve(response.data);
            console.log("response.data");
            console.log(response.data);
          } catch (error) {
            console.error("Error sending price offer email:", error);
            reject(error);
          }
        };

        reader.onerror = (error) => {
          console.error("Error converting PDF blob to base64:", error);
          reject(error);
        };
      });
    } catch (error) {
      console.error("An error occurred in sendPriceOfferEmail:", error);
      throw error;
    }
  };

  return (
    <>
      <div
        className={`${styles.routeAndDetails} ${
          styles.twoWaysRouteAndDetails
        } ${isVerifying && styles.blur}`}
      >
        <div className={styles.yourRoute}>
          <div className={styles.heading}>
            <h2>המסלול שלך</h2>
            <button
              onClick={() => props.handlePopup(false, <Popup show={false} />)}
            >
              שינוי המסלול
            </button>
            <div className={`${styles.outbound_inbound_mapsWrapper} `}>
              <div className={`${styles.outboundMap} ${styles.mapWrapper}`}>
                <h3>הלוך</h3>
                {props?.route?.outbound?.duration &&
                  props?.formatDuration(props?.route?.outbound?.duration)}
                <br />
                {props?.route?.outbound?.distance &&
                  props?.showDistance(props?.route?.outbound?.distance)}
                <GoogleMap
                  mapContainerStyle={mapStyles}
                  zoom={13}
                  mapContainerClassName={styles.mapContainer}
                >
                  {!loaded &&
                    outBoundStartPointCoors &&
                    outBoundEndPointCoors && (
                      <DirectionsService
                        options={{
                          origin: outBoundStartPointCoors,
                          destination: outBoundEndPointCoors,
                          waypoints: outBoundStopWaypoints,
                          travelMode: "DRIVING",
                        }}
                        callback={onLoadOutboundDirections}
                      />
                    )}

                  {/* Display the optimized route on the map */}
                  {outboundDirections && (
                    <DirectionsRenderer directions={outboundDirections} />
                  )}
                </GoogleMap>
              </div>
              {props?.route?.routeType == "TwoWays" && (
                <div className={`${styles.inboundMap} ${styles.mapWrapper}`}>
                  <h3>חזור</h3>
                  {props?.formatDuration(props?.route?.inbound?.duration)}
                  <br />
                  {props?.showDistance(props?.route?.inbound?.distance)}
                  <GoogleMap
                    mapContainerStyle={mapStyles}
                    zoom={13}
                    mapContainerClassName={styles.mapContainer}
                  >
                    {!loaded &&
                      inBoundStartPointCoors &&
                      inBoundEndPointCoors && (
                        <DirectionsService
                          options={{
                            origin: inBoundStartPointCoors,
                            destination: inBoundEndPointCoors,
                            waypoints: inBoundStopWaypoints,
                            travelMode: "DRIVING",
                          }}
                          callback={onLoadinboundDirections}
                        />
                      )}

                    {/* Display the optimized route on the map */}
                    {inboundDirections && (
                      <DirectionsRenderer directions={inboundDirections} />
                    )}
                  </GoogleMap>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.details}>
          <h2>קבלת הצעת המחיר</h2>
          <p>
            על מנת לקבל את הצעת המחיר מאיתנו, נבקש ממך להזין פרטים <br />
            מדויקים וכך נוכל לאמת את זהותך וכמובן לתת לך את הצעת <br />
            המחיר השווה שלנו מיד בסיום התהליך!
          </p>
          <form
            className={styles.twoSectionsForm}
            onSubmit={(e) => handleFormSubmit(e)}
          >
            <div className={styles.formSection}>
              <div
                className={`${styles.labelAndInputWrapper} ${styles.formColumn}`}
              >
                <label htmlFor="firstname">שם פרטי</label>
                <input type="text" name="firstname" id="firstname" required />
              </div>
              <div
                className={`${styles.labelAndInputWrapper} ${styles.formColumn}`}
              >
                <label htmlFor="lastname">שם משפחה</label>
                <input type="text" name="lastname" id="lastname" required />
              </div>
            </div>
            <div className={styles.formSection}>
              <div
                className={`${styles.labelAndInputWrapper} ${styles.formColumn}`}
              >
                <label htmlFor="email">אימייל</label>
                <input type="email" name="email" id="email" required />
              </div>
              <div
                className={`${styles.labelAndInputWrapper} ${styles.formColumn}`}
              >
                <label htmlFor="phone">טלפון</label>
                <input
                  type="number"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  name="phone"
                  id="phone"
                  required
                />
              </div>
            </div>
            <button className={styles.priceRequestButton}>המשך</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default React.memo(RouteAndDetails);
