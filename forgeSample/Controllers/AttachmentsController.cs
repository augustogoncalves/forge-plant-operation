using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace forgeSample.Controllers
{
    [ApiController]
    public class AttachmentController : ControllerBase
    {
        private IWebHostEnvironment _env;
        public AttachmentController(IWebHostEnvironment env) { _env = env; }

        [HttpGet]
        [Route("api/attachments/{pnpid}")]
        public async Task<IActionResult> GetAttachmentsAsync(string pnpid)
        {
            if (string.IsNullOrWhiteSpace(pnpid) || pnpid.IndexOf("/") > -1 || pnpid.IndexOf("\\") > -1) return BadRequest();

            string path = Path.Combine(_env.WebRootPath, "attachments/" + pnpid);
            if (!Directory.Exists(path)) return Ok();

            dynamic attachments = new JObject();
            attachments.docs = GetFiles(path, "docs/");
            attachments.images = GetFiles(path, "images/");
            return Ok(attachments);
        }

        JArray GetFiles(string path, string type)
        {
            string docsPath = Path.Combine(path, type);
            if (Directory.Exists(docsPath))
            {
                JArray files = new JArray();
                foreach (string file in Directory.GetFiles(docsPath))
                {
                    files.Add(file.Replace(_env.WebRootPath, string.Empty));
                }
                return files;
            }
            return null;
        }
    }
}