
let navigateFn = null;

export const setNavigate = (navigate) => {
    navigateFn = navigate;
};

export const redirectToLogin = () => {
    if (navigateFn) {
        navigateFn("/login", { replace: true });
    }
};