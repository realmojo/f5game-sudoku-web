import AdSense from "react-adsense";

export const SudokuAdsenseClear = () => {
  const isProduction = process.env.NODE_ENV === "production" ? true : false;

  return (
    <>
      {isProduction ? (
        <div className="text-center">
          <AdSense.Google
            style={{ display: "block" }}
            client="ca-pub-9130836798889522"
            slot="1398986853"
            format="auto"
            responsive="true"
          />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            height: "360px",
            backgroundColor: "#2d3436",
            margin: "0 auto",
          }}
        >
          애드센스
        </div>
      )}
    </>
  );
};
