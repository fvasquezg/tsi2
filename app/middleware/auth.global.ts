export default defineNuxtRouteMiddleware((to) => {
    const { loggedIn } = useUserSession();
    
    //aca van las partes que no necesitan cuenta
    const rutasPublicas = ["/login", "/", "/carrito", "/faq", "/gatos", "/index", "/marcas", "/perros", "/gatos"];

    //si no esta logueado y se mete a una pagina que no deberia dejar lo mand a login
    if (!loggedIn.value && !rutasPublicas.includes(to.path)) {
        return navigateTo("/login");
    }
});