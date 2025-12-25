import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Signup from "../../pages/Signup";
import api from "../../api/axiosInstance";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";


vi.mock("../../api/axiosInstance");

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("Signup Form Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error if required fields are empty", async () => {
    renderWithRouter(<Signup />);
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/please fill all fields/i)).toBeInTheDocument();
});

  it("shows error for weak password", async () => {
    renderWithRouter(<Signup />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "first last" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "name@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it("shows error if passwords do not match", async () => {
    renderWithRouter(<Signup />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "first last" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "name@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Password2!" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("shows error if full name missing first or last name", async () => {
    renderWithRouter(<Signup />);
      const fullNameInput = screen.getByLabelText(/full name/i);
  fireEvent.change(fullNameInput, { target: { value: "OnlyFirstName" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "name@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Password1!" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

   expect(await screen.findByText(/please enter your full name/i)).toBeInTheDocument();
});

  it("submits successfully and shows message", async () => {
    api.post.mockResolvedValue({ data: {} });

    renderWithRouter(<Signup />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "first last" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "name@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Password1!" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration done/i)).toBeInTheDocument();
    });
  });

  it("shows server error message if API fails", async () => {
    api.post.mockRejectedValue({ response: { data: { email: ["Email already exists"] } } });

    renderWithRouter(<Signup />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "first last" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "name@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Password1!" } });
   fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
  });
});
