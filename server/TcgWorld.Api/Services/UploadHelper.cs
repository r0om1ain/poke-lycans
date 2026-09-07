namespace TcgWorld.Api.Services;

// Miroir de server/src/middleware/upload.js (multer) — sauvegarde un fichier
// image sous wwwroot/uploads/{subdir}/ et renvoie son chemin public.
public class UploadHelper(IWebHostEnvironment env)
{
    public async Task<string> SaveAsync(IFormFile file, string subdir)
    {
        if (!file.ContentType.StartsWith("image/")) throw ApiException.BadRequest("Seuls les fichiers image sont acceptés");

        var dir = Path.Combine(env.WebRootPath, "uploads", subdir);
        Directory.CreateDirectory(dir);
        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(ext)) ext = ".jpg";
        var filename = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(dir, filename);
        await using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }
        return $"/uploads/{subdir}/{filename}";
    }
}
