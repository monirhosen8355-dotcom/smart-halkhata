function NatureHeader() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <style>{`
        .sky{
          position:absolute;
          inset:0;
          background:linear-gradient(180deg,#4FC3F7 0%,#64B5F6 45%,#81C784 100%);
        }

        .sun{
          position:absolute;
          top:25px;
          right:40px;
          width:70px;
          height:70px;
          border-radius:50%;
          background:#FFD54F;
          box-shadow:0 0 60px #FFD54F;
          animation:sunGlow 4s ease-in-out infinite;
        }

        .cloud{
          position:absolute;
          width:130px;
          height:40px;
          background:white;
          border-radius:50px;
          opacity:.85;
        }

        .cloud:before{
          content:"";
          position:absolute;
          width:55px;
          height:55px;
          background:white;
          border-radius:50%;
          left:18px;
          top:-22px;
        }

        .cloud:after{
          content:"";
          position:absolute;
          width:70px;
          height:70px;
          background:white;
          border-radius:50%;
          right:12px;
          top:-30px;
        }

        .c1{
          top:28px;
          left:-170px;
          animation:cloudMove 28s linear infinite;
        }

        .c2{
          top:85px;
          left:-220px;
          transform:scale(.8);
          opacity:.65;
          animation:cloudMove 40s linear infinite;
        }

        .hill1{
          position:absolute;
          bottom:-80px;
          left:-80px;
          width:380px;
          height:180px;
          border-radius:50%;
          background:#2E7D32;
        }

        .hill2{
          position:absolute;
          bottom:-95px;
          right:-120px;
          width:480px;
          height:220px;
          border-radius:50%;
          background:#388E3C;
        }

        .bird{
          position:absolute;
          font-size:22px;
          animation:birdFly 18s linear infinite;
        }

        .b1{
          top:45px;
          left:-50px;
        }

        .b2{
          top:70px;
          left:-180px;
          animation-delay:6s;
        }

        @keyframes cloudMove{
          from{transform:translateX(0);}
          to{transform:translateX(calc(100vw + 320px));}
        }

        @keyframes birdFly{
          from{
            transform:translateX(0) translateY(0);
          }
          50%{
            transform:translateX(60vw) translateY(-20px);
          }
          to{
            transform:translateX(calc(100vw + 220px)) translateY(10px);
          }
        }

        @keyframes sunGlow{
          50%{
            transform:scale(1.08);
            box-shadow:0 0 90px #FFE082;
          }
        }
      `}</style>

      <div className="sky"></div>

      <div className="sun"></div>

      <div className="cloud c1"></div>
      <div className="cloud c2"></div>

      <div className="hill1"></div>
      <div className="hill2"></div>

      <div className="bird b1">🕊️</div>
      <div className="bird b2">🕊️</div>
    </div>
  );
}

export default NatureHeader;