import { Delete$ } from "@aws-sdk/client-s3";

async function reportDeletionHandler (reportId) {
    try {
        const resp = await fetch(`/admin/dashboard/${reportId}`, {method: 'DELETE'});
        if (!resp.ok) throw `[reportDeletionHandler]: Failed to delete report: ${reportId}`;
        location.reload();
    } catch (e) {
        console.log(`Error occured deleting item: ${e}`)
    }
};