import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HashRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Login from "../../pages/Login/Login";
import api from "../../api/axiosInstance"; 
import storage from "../../auth/storage"

// Mock the API module
vi.mock("../../api/axiosInstance");

//  Mock the storage module to prevent side effects during auth handling
vi.mock("../../auth/storage", () => ({
  setAuth: vi.fn(),
  getAccessToken: vi.fn(),
  isAuthenticated: vi.fn(() => false),
}));

// 3. Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const renderWithRouter = (ui) => render(<HashRouter>{ui}</HashRouter>);

describe("Login Form Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error if required fields are empty", async () => {
    renderWithRouter(<Login />);
    
    // Attempt submit without data
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    
    // Expect error message
    expect(await screen.findByText(/please enter email and password/i)).toBeInTheDocument();
  });

  it("submits successfully with valid credentials", async () => {
    // Mock successful API response
    api.post.mockResolvedValue({ 
      data: { access: "fake_token", user: { id: 1, name: "Test User" } } 
    });

    renderWithRouter(<Login />);
    
    // Fill inputs
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "SecretPass123!" } });
    
    // Submit
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      // Check if API was called with correct data
      expect(api.post).toHaveBeenCalledWith("/auth/login/", {
        email: "user@example.com",
        password: "SecretPass123!",
      });
      // Check if user was redirected
      expect(mockedNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });

  it("shows error message if API fails (Invalid Credentials)", async () => {
    // Mock 401 Unauthorized response
    api.post.mockRejectedValue({ 
      response: { data: { detail: "No active account found with the given credentials" } } 
    });

    renderWithRouter(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "wrong@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "WrongPass" } });
    
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/no active account found/i)).toBeInTheDocument();
  });
});