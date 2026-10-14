namespace API.Services;

public class UploadStorage
{
    private readonly string _imgRoot;

    public UploadStorage(IWebHostEnvironment env)
    {
        _imgRoot = Path.GetFullPath(Path.Combine(env.WebRootPath, "img"));
    }

    public async Task<string> SaveAsync(IFormFile file, string extension, string folder)
    {
        var directory = Path.Combine(_imgRoot, folder);
        Directory.CreateDirectory(directory);

        var fileName = Guid.NewGuid() + extension;
        await using var stream = new FileStream(Path.Combine(directory, fileName), FileMode.CreateNew);
        await file.CopyToAsync(stream);

        return $"{folder}/{fileName}";
    }

    public void DeleteIfUpload(string? relativePath)
    {
        if (string.IsNullOrEmpty(relativePath)) return;

        var path = Path.GetFullPath(Path.Combine(_imgRoot, relativePath));

        if (!path.StartsWith(_imgRoot + Path.DirectorySeparatorChar)) return;
        if (!Guid.TryParse(Path.GetFileNameWithoutExtension(path), out _)) return;

        if (File.Exists(path))
            File.Delete(path);
    }
}