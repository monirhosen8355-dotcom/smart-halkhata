import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar6 from "../assets/avatars/avatar6.png";
import avatar7 from "../assets/avatars/avatar7.png";
import avatar8 from "../assets/avatars/avatar8.png";
import avatar9 from "../assets/avatars/avatar9.png";
import avatar10 from "../assets/avatars/avatar10.png";

const avatars = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10,
];

function AvatarPicker({
  selected,
  onSelect,
  onClose,
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed",
        inset:0,
        background:"rgba(0,0,0,.45)",
        zIndex:999999,
        display:"flex",
        alignItems:"flex-end",
      }}
    >

      <div
        onClick={(e)=>e.stopPropagation()}
        style={{
          width:"100%",
          background:"#fff",
          borderTopLeftRadius:"26px",
          borderTopRightRadius:"26px",
          padding:"22px",
          maxHeight:"70vh",
          overflowY:"auto",
        }}
      >

      <h2
      style={{
        margin:"0 0 20px",
        textAlign:"center",
      }}
      >
        Choose Avatar
      </h2>

      <div
      style={{
        display:"grid",
        gridTemplateColumns:"repeat(4,1fr)",
        gap:"16px",
      }}
      ></div>
              {avatars.map((img, i) => (
          <div
            key={i}
            onClick={() => {
              onSelect(img);
              onClose();
            }}
            style={{
              cursor: "pointer",
              border:
                selected === img
                  ? "3px solid #2563EB"
                  : "2px solid #E5E7EB",
              borderRadius: "18px",
              padding: "4px",
              transition: ".25s",
            }}
          >
            <img
              src={img}
              alt={`avatar-${i}`}
              style={{
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: "14px",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        style={{
          width: "100%",
          height: "50px",
          marginTop: "22px",
          border: "none",
          borderRadius: "14px",
          background: "#2563EB",
          color: "#fff",
          fontWeight: "700",
          fontSize: "15px",
          cursor: "pointer",
        }}
      >
        Close
      </button>

      </div>
    </div>
  );
}

export default AvatarPicker;


1.ei khane mone hoi eror ase 
2.mobile a profile button chara ar ekta o kaj korena 
3.choto profile icon tai dag ta kisher seta bad dite hobe