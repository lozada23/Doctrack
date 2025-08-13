import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ListGroup, Dropdown, Form } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import avatar2 from 'assets/images/user/carlos.png';

export default function NavRight() {
  const navigate = useNavigate(); // ✅ ahora sí dentro del componente

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          'http://localhost:3001/usuarios/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      navigate('/login');
    }
  };

  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown>
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0">
            <i className="material-icons-two-tone">search</i>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown drp-search">
            <Form className="px-3">
              <div className="form-group mb-0 d-flex align-items-center">
                <FeatherIcon icon="search" />
                <Form.Control type="search" className="border-0 shadow-none" placeholder="Search here. . ." />
              </div>
            </Form>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>

      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown className="drp-user">
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0 user-name">
            <img src={avatar2} alt="userimage" className="user-avatar" />
            <span>
              <span className="user-name">Carlos Lozada</span>
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown">
            <Dropdown.Header className="pro-head">
              <h5 className="text-overflow m-0">
                <span className="badge bg-light-success">Administrator</span>
              </h5>
            </Dropdown.Header>
            <Link to="/users/user-profile" className="dropdown-item">
              <i className="feather icon-user" /> Profile
            </Link>
            <Link to="/auth/signin-2" className="dropdown-item">
              <i className="feather icon-lock" /> Lock Screen
            </Link>
            <span onClick={handleLogout} className="dropdown-item" style={{ cursor: 'pointer' }}>
              <i className="material-icons-two-tone">chrome_reader_mode</i> Logout
            </span>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
    </ListGroup>
  );
}