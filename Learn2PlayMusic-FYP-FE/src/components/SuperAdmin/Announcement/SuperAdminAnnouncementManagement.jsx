import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Container, IconButton, Tooltip, Typography } from "@mui/material";
import MaterialReactTable from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import Loader from "../../utils/Loader";
import TransitionModal from "../../utils/TransitionModal";
import CreateAnnouncementForm from "./CreateAnnouncementForm";
import DeleteAnnouncementForm from "./DeleteAnnouncementForm";
import EditAnnouncementForm from "./EditAnnouncementForm";

const SuperAdminAnnouncementManagement = () => {
  const largeModalWidth = { xs: "90%", sm: "60%", md: "40%", lg: "40%", xl: "40%" };
  function modalStyle(w) {
    return {
      position: "relative",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: w,
      bgcolor: "background.paper",
      borderRadius: 2,
      p: 4,
    };
  }
  const [announcements, setAnnouncements] = useState([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [content, setContent] = useState("");
  const [dateId, setDateId] = useState("");
  const [reloadData, setReloadData] = useState(false);

  const [open, setOpen] = useState(true);
  // create
  const [openModal, setOpenModal] = useState(false);
  const handleCloseModal = () => setOpenModal(false);
  const handleCloseModalSuccess = () => {
    setOpenModal(false);
    setReloadData(!reloadData);
  };
  // // Edit
  const [openEditModal, setOpenEditModal] = useState(false);

  const handleCloseEditModal = () => setOpenEditModal(false);
  const handleCloseEditModalSuccess = () => {
    setOpenEditModal(false);
    setReloadData(!reloadData);
  };
  function handleOpenEditModal(dateId, announcementTitle, content) {
    setDateId(dateId);
    setAnnouncementTitle(announcementTitle);
    setContent(content);
    setOpenEditModal(true);
  }

  // delete
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);
  const handleCloseDeleteModalSuccess = () => {
    setOpenDeleteModal(false);
    setReloadData(!reloadData);
  };
  function handleOpenDeleteModal(dateId, announcementTitle, content) {
    setDateId(dateId);
    setAnnouncementTitle(announcementTitle);
    setContent(content);
    setOpenDeleteModal(true);
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        id: "title",
        header: "Title",
        size: 30,
        Cell: ({ cell, row }) => <Typography variant="body2">{row.original.title.length > 35 ? row.original.title.substring(0, 35) + "..." : row.original.title}</Typography>,
      },
      {
        accessorKey: "date",
        id: "date",
        header: "Date",
        size: 30,
      },
      {
        accessorKey: "content",
        id: "content",
        header: "Content",
        Cell: ({ cell, row }) => <Typography variant="body2">{row.original.content.length > 90 ? row.original.content.substring(0, 90) + "..." : row.original.content}</Typography>,
      },
      {
        accessorKey: "",
        id: "actions",
        header: "Actions",
        size: 30,
        Cell: ({ cell, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}>
            <Tooltip title="Edit" placement="bottom">
              <IconButton
                onClick={() => {
                  handleOpenEditModal(row.original.id, row.original.title, row.original.content);
                }}>
                <EditIcon></EditIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" placement="bottom">
              <IconButton
                color="error"
                onClick={() => {
                  handleOpenDeleteModal(row.original.id, row.original.title, row.original.content);
                }}>
                <DeleteForeverIcon></DeleteForeverIcon>
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
  );

  async function getAPI(endpoint) {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }
  useEffect(() => {
    setOpen(true);

    //`${import.meta.env.VITE_API_URL}/user/chat/contactlist?userId=${userInfo.userInfo.id}
    getAPI(`${import.meta.env.VITE_API_URL}/generalannouncement`).then((res) => {
      var fetchedData = res.map((announcement) => {
        const date = announcement.SK.split("#")[1].split("T")[0];
        const id = announcement.SK.split("#")[1];
        const content = announcement.Content;
        const title = announcement.AnnouncementTitle;
        return { id, date, content, title };
      });
      setAnnouncements(fetchedData);
      setOpen(false);
    });
  }, [reloadData]);
  return (
    <Container maxWidth="xl" sx={{ width: { xs: 1, sm: 0.9 } }}>
      {/* new announcement form */}
      <TransitionModal open={openModal} handleClose={handleCloseModal} style={modalStyle(largeModalWidth)}>
        <CreateAnnouncementForm handleCloseModal={handleCloseModal} handleCloseModalSuccess={handleCloseModalSuccess} />
      </TransitionModal>
      {/* edit announcement form */}
      <TransitionModal open={openEditModal} handleClose={handleCloseEditModal} style={modalStyle(largeModalWidth)}>
        <EditAnnouncementForm dateId={dateId} existingAnnouncementTitle={announcementTitle} existingContent={content} handleCloseEditModal={handleCloseEditModal} handleCloseEditModalSuccess={handleCloseEditModalSuccess} />
      </TransitionModal>

      {/* delete confirmation */}
      <TransitionModal open={openDeleteModal} handleClose={handleCloseDeleteModal} style={modalStyle(largeModalWidth)}>
        <DeleteAnnouncementForm dateId={dateId} announcementTitle={announcementTitle} content={content} handleCloseDeleteModal={handleCloseDeleteModal} handleCloseDeleteModalSuccess={handleCloseDeleteModalSuccess} />
      </TransitionModal>

      {/* header */}
      <Typography variant="h5" sx={{ m: 1, mt: 4 }}>
        Announcement Management
      </Typography>
      {/* table */}
      <MaterialReactTable
        enableHiding={false}
        enableFullScreenToggle={false}
        enableDensityToggle={false}
        columns={columns}
        data={announcements}
        enableExpanding={true}
        initialState={{ density: "compact", sorting: [{ id: "date", desc: true }] }}
        renderDetailPanel={({ row }) => (
          <Box
            sx={{
              display: "grid",

              width: "100%",
            }}>
            <Typography variant="h6">Title</Typography>
            <Typography variant="body2">{row.original.title}</Typography>
            <Typography variant="h6">Content</Typography>
            <Typography variant="body2">{row.original.content}</Typography>
          </Box>
        )}
        renderTopToolbarCustomActions={({ table }) => {
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                my: 1,
              }}>
              <Button
                variant="contained"
                onClick={() => {
                  setOpenModal(true);
                }}>
                New Announcement
              </Button>
            </Box>
          );
        }}></MaterialReactTable>
      <Loader open={open} />
    </Container>
  );
};
export default SuperAdminAnnouncementManagement;
